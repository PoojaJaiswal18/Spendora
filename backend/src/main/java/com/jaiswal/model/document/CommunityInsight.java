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
}

