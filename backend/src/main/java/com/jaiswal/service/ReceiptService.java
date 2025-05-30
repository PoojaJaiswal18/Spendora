package com.jaiswal.service;

import com.jaiswal.exception.ResourceNotFoundException;
import com.jaiswal.exception.ValidationException;
import com.jaiswal.model.document.Receipt;
import com.jaiswal.model.dto.ReceiptDTO;
import com.jaiswal.repository.ReceiptRepository;
import com.jaiswal.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final OCRService ocrService;
    private final CategoryService categoryService;
    private final FileUtils fileUtils;

    @Cacheable(value = "receipts", key = "#userId + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<ReceiptDTO> getReceiptsByUser(String userId, Pageable pageable) {
        Page<Receipt> receipts = receiptRepository.findByUserIdOrderByDateDesc(userId, pageable);
        return receipts.map(this::convertToDTO);
    }

    @Cacheable(value = "receipts", key = "#receiptId")
    public ReceiptDTO getReceiptById(String receiptId, String userId) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + receiptId));

        if (!receipt.getUserId().equals(userId)) {
            throw new ValidationException("Receipt does not belong to user");
        }

        return convertToDTO(receipt);
    }

    @Transactional
    public CompletableFuture<ReceiptDTO> processReceiptUpload(String userId, MultipartFile file) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate file
                validateReceiptFile(file);

                // Save file
                String imageUrl = fileUtils.saveReceiptImage(file, userId);

                // Create initial receipt record
                Receipt receipt = Receipt.builder()
                        .userId(userId)
                        .imageUrl(imageUrl)
                        .originalFileName(file.getOriginalFilename())
                        .status(Receipt.ReceiptStatus.PROCESSING)
                        .build();

                Receipt savedReceipt = receiptRepository.save(receipt);
                log.info("Created receipt record for processing: {}", savedReceipt.getId());

                // Process OCR asynchronously
                processOCRAsync(savedReceipt);

                return convertToDTO(savedReceipt);

            } catch (Exception e) {
                log.error("Error processing receipt upload for user: {}", userId, e);
                throw new RuntimeException("Failed to process receipt upload", e);
            }
        });
    }

    @Transactional
    @CacheEvict(value = "receipts", allEntries = true)
    public ReceiptDTO updateReceipt(String receiptId, String userId, ReceiptDTO receiptDTO) {
        Receipt existingReceipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + receiptId));

        if (!existingReceipt.getUserId().equals(userId)) {
            throw new ValidationException("Receipt does not belong to user");
        }

        // Update fields
        if (receiptDTO.getMerchantName() != null) {
            existingReceipt.setMerchantName(receiptDTO.getMerchantName());
        }
        if (receiptDTO.getTotalAmount() != null) {
            existingReceipt.setTotalAmount(receiptDTO.getTotalAmount());
        }
        if (receiptDTO.getDate() != null) {
            existingReceipt.setDate(receiptDTO.getDate());
        }
        if (receiptDTO.getCategoryId() != null) {
            existingReceipt.setCategoryId(receiptDTO.getCategoryId());
        }
        if (receiptDTO.getDescription() != null) {
            existingReceipt.setDescription(receiptDTO.getDescription());
        }
        if (receiptDTO.getItems() != null) {
            existingReceipt.setItems(convertItemsFromDTO(receiptDTO.getItems()));
        }

        Receipt updatedReceipt = receiptRepository.save(existingReceipt);
        log.info("Updated receipt: {}", updatedReceipt.getId());

        return convertToDTO(updatedReceipt);

