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
public class AnalyticsDTO {

    private SpendingSummary spendingSummary;
    private List<CategoryBreakdown> categoryBreakdown;
    private List<SpendingTrend> spendingTrends;
    private List<MonthlyComparison> monthlyComparisons;
    private List<InsightData> insights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpendingSummary {
        private BigDecimal totalThisMonth;
        private BigDecimal totalLastMonth;
        private BigDecimal totalThisYear;
        private BigDecimal averagePerDay;
        private BigDecimal averagePerTransaction;
        private Integer totalTransactions;
        private BigDecimal percentageChange;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String categoryId;
        private String categoryName;
        private String categoryColor;
        private BigDecimal amount;
        private Double percentage;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpendingTrend {
        private LocalDate date;
        private BigDecimal amount;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyComparison {
        private String month;
        private BigDecimal currentYear;
        private BigDecimal previousYear;
        private Double changePercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsightData {
        private String type;
        private String title;
        private String description;
        private String icon;
        private Map<String, Object> data;
    }
}

