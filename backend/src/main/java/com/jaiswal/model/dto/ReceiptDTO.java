package com.jaiswal.model.dto;

import com.jaiswal.model.document.Receipt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptDTO {

    private String id;

    @NotBlank(message = "User ID is required")
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
    private List<ReceiptItemDTO> items;
    private Receipt.ReceiptStatus status;
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

    // Static factory method for conversion from Receipt entity
    public static ReceiptDTO from(Receipt receipt) {
        if (receipt == null) {
            return null;
        }

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
                .items(convertItems(receipt.getItems()))
                .status(receipt.getStatus())
                .createdAt(receipt.getCreatedAt())
                .updatedAt(receipt.getUpdatedAt())
                .build();
    }

    private static List<ReceiptItemDTO> convertItems(List<Receipt.ReceiptItem> items) {
        if (items == null) {
            return null;
        }
        return items.stream()
                .map(item -> ReceiptItemDTO.builder()
                        .name(item.getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .category(item.getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    // Helper methods for backward compatibility (used by ReportService)
    public BigDecimal getAmount() {
        return this.totalAmount;
    }

    public void setAmount(BigDecimal amount) {
        this.totalAmount = amount;
    }

    public String getCategory() {
        return this.categoryId;
    }

    public void setCategory(String category) {
        this.categoryId = category;
    }

    // Additional helper method for merchant compatibility
    public String getMerchant() {
        return this.merchantName;
    }

    public void setMerchant(String merchant) {
        this.merchantName = merchant;
    }
}
