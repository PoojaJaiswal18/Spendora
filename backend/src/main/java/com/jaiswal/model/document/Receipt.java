package com.jaiswal.model.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "receipts")
@CompoundIndex(def = "{'userId': 1, 'date': -1}")
@CompoundIndex(def = "{'userId': 1, 'categoryId': 1}")
public class Receipt {

    @Id
    private String id;

    @NotBlank(message = "User ID is required")
    @Indexed
    private String userId;

    @NotBlank(message = "Merchant name is required")
    private String merchantName;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal totalAmount;

    @NotNull(message = "Receipt date is required")
    @PastOrPresent(message = "Receipt date cannot be in the future")
    private LocalDate date;

    private String categoryId;

    private String description;

    private String imageUrl;

    private String originalFileName;

    private List<ReceiptItem> items;

    private OCRData ocrData;

    private PaymentInfo paymentInfo;

    @Builder.Default
    private ReceiptStatus status = ReceiptStatus.PROCESSED;

    private Map<String, Object> metadata;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptItem {
        private String name;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OCRData {
        private String extractedText;
        private Double confidence;
        private LocalDateTime processedAt;
        private String ocrEngine;
        private Map<String, Object> rawData;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String method; // CASH, CARD, DIGITAL
        private String cardType; // VISA, MASTERCARD, etc.
        private String lastFourDigits;
        private BigDecimal tip;
        private BigDecimal tax;
    }

    public enum ReceiptStatus {
        PENDING, PROCESSING, PROCESSED, FAILED, ARCHIVED
    }
}

