package com.jaiswal.controller;

import com.jaiswal.model.dto.ApiResponse;
import com.jaiswal.model.dto.ReceiptDTO;
import com.jaiswal.service.ReceiptService;
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
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ReceiptDTO>> uploadReceipt(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Receipt upload request from user: {}", userDetails.getUsername());

        CompletableFuture<ReceiptDTO> futureReceipt = receiptService.processReceiptUpload(
                getUserId(userDetails), file);

        ReceiptDTO receipt = futureReceipt.join();

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Receipt uploaded successfully and is being processed", receipt));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReceiptDTO>>> getReceipts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @AuthenticationPrincipal UserDetails userDetails) {

        Pageable pageable = PageRequest.of(page, size);

        Page<ReceiptDTO> receipts;

        if (categoryId != null || startDate != null || endDate != null || minAmount != null || maxAmount != null) {
            receipts = receiptService.getFilteredReceipts(
                    getUserId(userDetails), pageable, categoryId, startDate, endDate, minAmount, maxAmount);
        } else {
            receipts = receiptService.getReceiptsByUser(getUserId(userDetails), pageable);
        }

        // Create pagination metadata
        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(receipts.getNumber())
                .size(receipts.getSize())
                .totalElements(receipts.getTotalElements())
                .totalPages(receipts.getTotalPages())
                .first(receipts.isFirst())
                .last(receipts.isLast())
                .hasNext(receipts.hasNext())
                .hasPrevious(receipts.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.paginated(receipts, pagination));
    }

    @GetMapping("/{receiptId}")
    public ResponseEntity<ApiResponse<ReceiptDTO>> getReceiptById(
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ReceiptDTO receipt = receiptService.getReceiptById(receiptId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(receipt));
    }

    @PutMapping("/{receiptId}")
    public ResponseEntity<ApiResponse<ReceiptDTO>> updateReceipt(
            @PathVariable String receiptId,
            @Valid @RequestBody ReceiptDTO receiptDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        ReceiptDTO updatedReceipt = receiptService.updateReceipt(receiptId, getUserId(userDetails), receiptDTO);
        return ResponseEntity.ok(ApiResponse.success("Receipt updated successfully", updatedReceipt));
    }

    @DeleteMapping("/{receiptId}")
    public ResponseEntity<ApiResponse<Void>> deleteReceipt(
            @PathVariable String receiptId,
            @AuthenticationPrincipal UserDetails userDetails) {

        receiptService.deleteReceipt(receiptId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Receipt deleted successfully", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ReceiptDTO>>> searchReceipts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReceiptDTO> receipts = receiptService.searchReceipts(getUserId(userDetails), query, pageable);

        // Create pagination metadata
        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(receipts.getNumber())
                .size(receipts.getSize())
                .totalElements(receipts.getTotalElements())
                .totalPages(receipts.getTotalPages())
                .first(receipts.isFirst())
                .last(receipts.isLast())
                .hasNext(receipts.hasNext())
                .hasPrevious(receipts.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.paginated(receipts, pagination));
    }

    private String getUserId(UserDetails userDetails) {
        return ((com.jaiswal.model.document.User) userDetails).getId();
    }
}
