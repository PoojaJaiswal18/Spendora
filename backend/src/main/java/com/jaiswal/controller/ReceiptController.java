package com.jaiswal.controller;

import com.jaiswal.model.dto.ApiResponse;
import com.jaiswal.model.dto.ReceiptDTO;
import com.jaiswal.service.ReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
@Validated
@Tag(name = "Receipt Management", description = "APIs for managing receipt uploads, processing, and retrieval")
@SecurityRequirement(name = "bearerAuth")
public class ReceiptController {

    private final ReceiptService receiptService;

    @Operation(summary = "Upload receipt image", description = "Upload a receipt image for OCR processing and data extraction")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description = "Receipt upload accepted for processing"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file format or size"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ReceiptDTO>> uploadReceipt(
            @Parameter(description = "Receipt image file (JPEG, PNG, PDF)", required = true)
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Receipt upload request from user: {}", userDetails.getUsername());

        CompletableFuture<ReceiptDTO> futureReceipt = receiptService.processReceiptUpload(
                getUserId(userDetails), file);

        ReceiptDTO receipt = futureReceipt.join(); // For demo - in production use async handling

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Receipt uploaded successfully and is being processed", receipt));
    }

    @Operation(summary = "Get user receipts", description = "Retrieve paginated list of user's receipts")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReceiptDTO>>> getReceipts(
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @Parameter(description = "Filter by category ID")
            @RequestParam(required = false) String categoryId,
            @Parameter(description = "Filter by start date")
            @RequestParam(required = false) LocalDate startDate,
            @Parameter(description = "Filter by end date")
            @RequestParam(required = false) LocalDate endDate,
            @Parameter(description = "Filter by minimum amount")
            @RequestParam(required = false) BigDecimal minAmount,
            @Parameter(description = "Filter by maximum amount")
            @RequestParam(required = false) BigDecimal maxAmount,
            @AuthenticationPrincipal UserDetails userDetails) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReceiptDTO> receipts = receiptService.getReceiptsByUser(getUserId(userDetails), pageable);

        return ResponseEntity.ok(ApiResponse.success(receipts));
    }

    @Operation(summary = "Get receipt by ID", description = "Retrieve detailed information about a specific receipt")
    @GetMapping("/{receiptId}")
    public ResponseEntity<ApiResponse<ReceiptDTO>> getReceiptById(
            @Parameter(description = "Receipt ID", required = true)
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ReceiptDTO receipt = receiptService.getReceiptById(receiptId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(receipt));
    }

    @Operation(summary = "Update receipt", description = "Update receipt information")
    @PutMapping("/{receiptId}")
    public ResponseEntity<ApiResponse<ReceiptDTO>> updateReceipt(
            @Parameter(description = "Receipt ID", required = true)
            @PathVariable String receiptId,
            @Valid @RequestBody ReceiptDTO receiptDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        ReceiptDTO updatedReceipt = receiptService.updateReceipt(receiptId, getUserId(userDetails), receiptDTO);
        return ResponseEntity.ok(ApiResponse.success("Receipt updated successfully", updatedReceipt));
    }

    @Operation(summary = "Delete receipt", description = "Delete a receipt")
    @DeleteMapping("/{receiptId}")
    public ResponseEntity<ApiResponse<Void>> deleteReceipt(
            @Parameter(description = "Receipt ID", required = true)
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserDetails userDetails) {

        receiptService.deleteReceipt(receiptId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Receipt deleted successfully", null));
    }

    @Operation(summary = "Search receipts", description = "Search receipts by merchant name or description")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ReceiptDTO>>> searchReceipts(
            @Parameter(description = "Search query")
            @RequestParam String query,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReceiptDTO> receipts = receiptService.searchReceipts(getUserId(userDetails), query, pageable);

        return ResponseEntity.ok(ApiResponse.success(receipts));
    }

    private String getUserId(UserDetails userDetails) {
        // Assuming UserDetails implementation has getId() method
        return ((com.jaiswal.model.document.User) userDetails).getId();
    }
}

