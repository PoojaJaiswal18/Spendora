package com.jaiswal.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jaiswal.model.document.Receipt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReceiptDTO {

    private String id;

    @NotBlank(message = "Merchant name is required")
    private String merchantName;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal totalAmount;

    @NotNull(message = "Receipt date is required")
    private LocalDate date;

    private String categoryId;
    private String categoryName;
    private String description;
    private String imageUrl;
    private List<ReceiptItemDTO> items;
    private OCRDataDTO ocrData;
    private PaymentInfoDTO paymentInfo;
    private Receipt.ReceiptStatus status;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptItemDTO {
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
    public static class OCRDataDTO {
        private String extractedText;
        private Double confidence;
        private LocalDateTime processedAt;
        private String ocrEngine;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfoDTO {
        private String method;
        private String cardType;
        private String lastFourDigits;
        private BigDecimal tip;
        private BigDecimal tax;
    }
}

