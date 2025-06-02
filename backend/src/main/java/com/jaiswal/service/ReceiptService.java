package com.jaiswal.service;

import com.jaiswal.exception.ResourceNotFoundException;
import com.jaiswal.exception.ValidationException;
import com.jaiswal.model.document.Receipt;
import com.jaiswal.model.dto.ReceiptDTO;
import com.jaiswal.repository.ReceiptRepository;
import com.jaiswal.util.FileUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@EnableAsync
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final OCRService ocrService;
    private final FileUtils fileUtils;

    @Value("${app.upload.receipt-images}")
    private String receiptImageUploadPath;

    @Value("${app.receipt.allowed-types:jpg,jpeg,png,pdf}")
    private String[] allowedFileTypes;

    @Value("${app.receipt.max-size:10485760}") // 10MB
    private long maxFileSize;

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

    // Added missing method for filtered receipts
    public Page<ReceiptDTO> getFilteredReceipts(String userId, Pageable pageable, String categoryId,
                                                LocalDate startDate, LocalDate endDate,
                                                BigDecimal minAmount, BigDecimal maxAmount) {

        List<Receipt> allReceipts = receiptRepository.findByUserId(userId);

        // Apply filters
        List<Receipt> filteredReceipts = allReceipts.stream()
                .filter(receipt -> categoryId == null || categoryId.equals(receipt.getCategoryId()))
                .filter(receipt -> startDate == null || !receipt.getDate().isBefore(startDate))
                .filter(receipt -> endDate == null || !receipt.getDate().isAfter(endDate))
                .filter(receipt -> minAmount == null || receipt.getTotalAmount().compareTo(minAmount) >= 0)
                .filter(receipt -> maxAmount == null || receipt.getTotalAmount().compareTo(maxAmount) <= 0)
                .collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredReceipts.size());

        List<Receipt> pageContent = filteredReceipts.subList(start, end);
        List<ReceiptDTO> pageContentDTO = pageContent.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContentDTO, pageable, filteredReceipts.size());
    }

    // Added missing searchReceipts method
    @Cacheable(value = "searchResults", key = "#userId + '_' + #query + '_' + #pageable.pageNumber")
    public Page<ReceiptDTO> searchReceipts(String userId, String query, Pageable pageable) {
        List<Receipt> searchResults = receiptRepository.findByUserIdAndMerchantNameContainingIgnoreCase(userId, query);

        // Manual pagination for search results
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), searchResults.size());

        List<Receipt> pageContent = searchResults.subList(start, end);
        List<ReceiptDTO> pageContentDTO = pageContent.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContentDTO, pageable, searchResults.size());
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
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                Receipt savedReceipt = receiptRepository.save(receipt);
                log.info("Created receipt record for processing: {}", savedReceipt.getId());

                // Process OCR asynchronously
                processOCRAsync(savedReceipt, file);

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

        existingReceipt.setUpdatedAt(LocalDateTime.now());
        Receipt updatedReceipt = receiptRepository.save(existingReceipt);

        log.info("Updated receipt: {}", updatedReceipt.getId());
        return convertToDTO(updatedReceipt);
    }

    @Transactional
    @CacheEvict(value = "receipts", allEntries = true)
    public void deleteReceipt(String receiptId, String userId) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + receiptId));

        if (!receipt.getUserId().equals(userId)) {
            throw new ValidationException("Receipt does not belong to user");
        }

        receiptRepository.delete(receipt);
        log.info("Deleted receipt: {}", receiptId);
    }

    // Private helper methods
    private void validateReceiptFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new ValidationException("File size exceeds maximum allowed size");
        }

        String fileExtension = getFileExtension(file.getOriginalFilename());
        boolean isValidType = false;
        for (String allowedType : allowedFileTypes) {
            if (allowedType.equalsIgnoreCase(fileExtension)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new ValidationException("File type not supported. Allowed types: " + String.join(", ", allowedFileTypes));
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }

        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1) : "";
    }

    @Async("taskExecutor")
    public CompletableFuture<Void> processOCRAsync(Receipt receipt, MultipartFile file) {
        return CompletableFuture.runAsync(() -> {
            try {
                log.info("Starting OCR processing for receipt: {}", receipt.getId());

                // Process OCR
                Receipt.OCRData ocrData = ocrService.processReceiptImage(file).get();

                // Parse receipt data
                OCRService.ParsedReceiptData parsedData = ocrService.parseReceiptData(ocrData.getExtractedText());

                // Update receipt with OCR data
                receipt.setOcrData(ocrData);
                receipt.setMerchantName(parsedData.getMerchantName());
                receipt.setTotalAmount(parsedData.getTotalAmount());
                receipt.setDate(parsedData.getDate());
                receipt.setItems(parsedData.getItems());
                receipt.setPaymentInfo(parsedData.getPaymentInfo());
                receipt.setStatus(Receipt.ReceiptStatus.PROCESSED);
                receipt.setUpdatedAt(LocalDateTime.now());

                receiptRepository.save(receipt);
                log.info("OCR processing completed for receipt: {}", receipt.getId());

            } catch (Exception e) {
                log.error("OCR processing failed for receipt: {}", receipt.getId(), e);
                receipt.setStatus(Receipt.ReceiptStatus.FAILED);
                receipt.setUpdatedAt(LocalDateTime.now());
                receiptRepository.save(receipt);
            }
        });
    }

    private ReceiptDTO convertToDTO(Receipt receipt) {
        return ReceiptDTO.builder()
                .id(receipt.getId())
                .userId(receipt.getUserId())
                .merchantName(receipt.getMerchantName())
                .totalAmount(receipt.getTotalAmount())
                .date(receipt.getDate())
                .categoryId(receipt.getCategoryId())
                .description(receipt.getDescription())
                .imageUrl(receipt.getImageUrl())
                .originalFileName(receipt.getOriginalFileName())
                .items(convertItemsToDTO(receipt.getItems()))
                .status(receipt.getStatus())
                .createdAt(receipt.getCreatedAt())
                .updatedAt(receipt.getUpdatedAt())
                .build();
    }

    private List<ReceiptDTO.ReceiptItemDTO> convertItemsToDTO(List<Receipt.ReceiptItem> items) {
        if (items == null) {
            return null;
        }

        return items.stream()
                .map(item -> ReceiptDTO.ReceiptItemDTO.builder()
                        .name(item.getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .category(item.getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    private List<Receipt.ReceiptItem> convertItemsFromDTO(List<ReceiptDTO.ReceiptItemDTO> itemDTOs) {
        if (itemDTOs == null) {
            return null;
        }

        return itemDTOs.stream()
                .map(itemDTO -> Receipt.ReceiptItem.builder()
                        .name(itemDTO.getName())
                        .quantity(itemDTO.getQuantity())
                        .unitPrice(itemDTO.getUnitPrice())
                        .totalPrice(itemDTO.getTotalPrice())
                        .category(itemDTO.getCategory())
                        .build())
                .collect(Collectors.toList());
    }
}
