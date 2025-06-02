package com.jaiswal.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {

    private String reportId;
    private String reportType;
    private String title;
    private String userId;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate generatedAt;

    // Added missing fields for ReportService compatibility
    private BigDecimal totalAmount;
    private Map<String, BigDecimal> categoryBreakdown;
    private List<ReceiptDTO> receipts;

    private ReportSummary summary;
    private List<ReportSection> sections;
    private Map<String, Object> metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportSummary {
        private BigDecimal totalAmount;
        private Integer totalTransactions;
        private BigDecimal averageTransaction;
        private String topCategory;
        private String topMerchant;
        private Map<String, BigDecimal> categoryTotals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportSection {
        private String sectionType;
        private String title;
        private List<ReportItem> items;
        private Map<String, Object> chartData;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportItem {
        private String id;
        private String description;
        private BigDecimal amount;
        private LocalDate date;
        private String category;
        private String merchant;
        private Map<String, Object> details;
    }

    // Helper method to set period based on dates
    public void setPeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            this.period = startDate.toString() + " to " + endDate.toString();
        }
    }

    // Helper method to set amount from summary
    public BigDecimal getAmount() {
        return this.totalAmount;
    }

    public void setAmount(BigDecimal amount) {
        this.totalAmount = amount;
    }
}
