package com.jaiswal.model.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "community_insights")
public class CommunityInsight {

    @Id
    private String id;

    @Indexed
    private String insightType; // SPENDING_AVERAGE, CATEGORY_TRENDS, etc.

    @Indexed
    private String period; // DAILY, WEEKLY, MONTHLY, YEARLY

    @Indexed
    private String category;

    private String title;

    private String description;

    private Map<String, Object> data;

    private StatisticalData statistics;

    private DemographicFilters filters;

    @CreatedDate
    private LocalDateTime generatedAt;

    @Indexed
    private LocalDateTime validUntil;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatisticalData {
        private BigDecimal average;
        private BigDecimal median;
        private BigDecimal min;
        private BigDecimal max;
        private Long sampleSize;
        private Double standardDeviation;
        private Map<String, BigDecimal> percentiles;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DemographicFilters {
        private String ageGroup;
        private String region;
        private String incomeRange;
        private String userSegment;
    }

    // Helper methods for AnonymizationService compatibility
    public void setTimestamp(Date timestamp) {
        if (timestamp != null) {
            this.generatedAt = timestamp.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
        }
    }

    public Date getTimestamp() {
        if (this.generatedAt != null) {
            return Date.from(this.generatedAt
                    .atZone(java.time.ZoneId.systemDefault())
                    .toInstant());
        }
        return null;
    }

    public void setCategoryTotals(Map<String, BigDecimal> categoryTotals) {
        if (this.data == null) {
            this.data = new HashMap<>();
        }
        this.data.put("categoryTotals", categoryTotals);
    }

    @SuppressWarnings("unchecked")
    public Map<String, BigDecimal> getCategoryTotals() {
        if (this.data != null && this.data.containsKey("categoryTotals")) {
            Object categoryTotalsObj = this.data.get("categoryTotals");
            if (categoryTotalsObj instanceof Map) {
                return (Map<String, BigDecimal>) categoryTotalsObj;
            }
        }
        return new HashMap<>();
    }

    // Additional utility methods
    public void addDataEntry(String key, Object value) {
        if (this.data == null) {
            this.data = new HashMap<>();
        }
        this.data.put(key, value);
    }

    public Object getDataEntry(String key) {
        if (this.data != null) {
            return this.data.get(key);
        }
        return null;
    }

    public boolean isValid() {
        return this.validUntil != null && this.validUntil.isAfter(LocalDateTime.now());
    }

    public boolean isExpired() {
        return this.validUntil != null && this.validUntil.isBefore(LocalDateTime.now());
    }

    // Builder enhancement for easier creation
    public static class CommunityInsightBuilder {
        public CommunityInsightBuilder withCategoryTotals(Map<String, BigDecimal> categoryTotals) {
            if (this.data == null) {
                this.data = new HashMap<>();
            }
            this.data.put("categoryTotals", categoryTotals);
            return this;
        }

        public CommunityInsightBuilder withDataEntry(String key, Object value) {
            if (this.data == null) {
                this.data = new HashMap<>();
            }
            this.data.put(key, value);
            return this;
        }
    }
}
