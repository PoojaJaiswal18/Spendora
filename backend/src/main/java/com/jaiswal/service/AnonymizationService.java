package com.jaiswal.service;

import com.jaiswal.model.document.Receipt;
import com.jaiswal.model.document.CommunityInsight;
import com.jaiswal.repository.ReceiptRepository;
import com.jaiswal.repository.CommunityInsightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnonymizationService {

    private final ReceiptRepository receiptRepository;
    private final CommunityInsightRepository communityInsightRepository;

    /**
     * Aggregates and anonymizes spending data for community insights
     */
    @Async
    @Transactional
    public void anonymizeAndAggregate() {
        try {
            log.info("Starting anonymization and aggregation process");

            List<Receipt> receipts = receiptRepository.findAll();

            if (receipts.isEmpty()) {
                log.warn("No receipts found for anonymization");
                return;
            }

            // Calculate category totals with proper anonymization
            Map<String, BigDecimal> categoryTotals = receipts.stream()
                    .filter(receipt -> receipt.getCategoryId() != null && receipt.getTotalAmount() != null)
                    .collect(Collectors.groupingBy(
                            receipt -> receipt.getCategoryId(),
                            Collectors.reducing(BigDecimal.ZERO, Receipt::getTotalAmount, BigDecimal::add)
                    ));

            // Create anonymized statistical data
            CommunityInsight.StatisticalData statistics = calculateStatistics(receipts);

            // Create community insight with anonymized data
            CommunityInsight insight = CommunityInsight.builder()
                    .insightType("SPENDING_AVERAGE")
                    .period("MONTHLY")
                    .title("Community Spending Insights")
                    .description("Anonymized aggregated spending data for community analysis")
                    .data(createAnonymizedData(categoryTotals, receipts))
                    .statistics(statistics)
                    .generatedAt(LocalDateTime.now())
                    .validUntil(LocalDateTime.now().plusDays(30))
                    .build();

            communityInsightRepository.save(insight);
            log.info("Successfully created community insight with {} categories", categoryTotals.size());

        } catch (Exception e) {
            log.error("Error during anonymization and aggregation", e);
            throw new RuntimeException("Failed to anonymize and aggregate data", e);
        }
    }

    /**
     * Returns anonymized community insights for frontend display
     */
    @Cacheable(value = "communityInsights", key = "'latest'")
    public CommunityInsight getLatestCommunityInsight() {
        return communityInsightRepository.findTopByOrderByGeneratedAtDesc()
                .orElse(createDefaultInsight());
    }

    /**
     * Get category-specific insights
     */
    @Cacheable(value = "categoryInsights", key = "#category")
    public List<CommunityInsight> getCategoryInsights(String category) {
        return communityInsightRepository.findValidInsightsByCategory(category, LocalDateTime.now());
    }

    /**
     * Get insights by type and period
     */
    @Cacheable(value = "insightsByType", key = "#insightType + '_' + #period")
    public Optional<CommunityInsight> getInsightByTypeAndPeriod(String insightType, String period) {
        return communityInsightRepository.findValidInsight(insightType, period, LocalDateTime.now());
    }

    /**
     * Clean up expired insights
     */
    @Transactional
    public void cleanupExpiredInsights() {
        try {
            List<CommunityInsight> expiredInsights = communityInsightRepository.findExpiredInsights(LocalDateTime.now());
            if (!expiredInsights.isEmpty()) {
                communityInsightRepository.deleteByValidUntilBefore(LocalDateTime.now());
                log.info("Cleaned up {} expired insights", expiredInsights.size());
            }
        } catch (Exception e) {
            log.error("Error cleaning up expired insights", e);
        }
    }

    // Private helper methods

    private CommunityInsight.StatisticalData calculateStatistics(List<Receipt> receipts) {
        List<BigDecimal> amounts = receipts.stream()
                .map(Receipt::getTotalAmount)
                .filter(Objects::nonNull)
                .filter(amount -> amount.compareTo(BigDecimal.ZERO) > 0)
                .sorted()
                .collect(Collectors.toList());

        if (amounts.isEmpty()) {
            return createEmptyStatistics();
        }

        BigDecimal sum = amounts.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal average = sum.divide(BigDecimal.valueOf(amounts.size()), 2, BigDecimal.ROUND_HALF_UP);

        BigDecimal median = calculateMedian(amounts);
        BigDecimal min = amounts.get(0);
        BigDecimal max = amounts.get(amounts.size() - 1);

        double standardDeviation = calculateStandardDeviation(amounts, average);
        Map<String, BigDecimal> percentiles = calculatePercentiles(amounts);

        return CommunityInsight.StatisticalData.builder()
                .average(average)
                .median(median)
                .min(min)
                .max(max)
                .sampleSize((long) amounts.size())
                .standardDeviation(standardDeviation)
                .percentiles(percentiles)
                .build();
    }

    private BigDecimal calculateMedian(List<BigDecimal> sortedAmounts) {
        int size = sortedAmounts.size();
        if (size % 2 == 0) {
            BigDecimal mid1 = sortedAmounts.get(size / 2 - 1);
            BigDecimal mid2 = sortedAmounts.get(size / 2);
            return mid1.add(mid2).divide(BigDecimal.valueOf(2), 2, BigDecimal.ROUND_HALF_UP);
        } else {
            return sortedAmounts.get(size / 2);
        }
    }

    private double calculateStandardDeviation(List<BigDecimal> amounts, BigDecimal average) {
        double variance = amounts.stream()
                .mapToDouble(amount -> {
                    BigDecimal diff = amount.subtract(average);
                    return diff.multiply(diff).doubleValue();
                })
                .average()
                .orElse(0.0);

        return Math.sqrt(variance);
    }

    private Map<String, BigDecimal> calculatePercentiles(List<BigDecimal> sortedAmounts) {
        Map<String, BigDecimal> percentiles = new HashMap<>();

        int[] percentileValues = {25, 50, 75, 90, 95};

        for (int percentile : percentileValues) {
            int index = (int) Math.ceil((percentile / 100.0) * sortedAmounts.size()) - 1;
            index = Math.max(0, Math.min(index, sortedAmounts.size() - 1));
            percentiles.put("p" + percentile, sortedAmounts.get(index));
        }

        return percentiles;
    }

    private Map<String, Object> createAnonymizedData(Map<String, BigDecimal> categoryTotals, List<Receipt> receipts) {
        Map<String, Object> data = new HashMap<>();

        // Anonymize category data by removing small sample sizes
        Map<String, BigDecimal> filteredCategories = categoryTotals.entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(BigDecimal.valueOf(100)) >= 0) // Minimum threshold
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        data.put("categoryTotals", filteredCategories);
        data.put("totalReceipts", receipts.size());
        data.put("totalCategories", filteredCategories.size());
        data.put("dataGeneratedAt", LocalDateTime.now().toString());

        // Add aggregated merchant data (anonymized)
        Map<String, Long> merchantCounts = receipts.stream()
                .filter(receipt -> receipt.getMerchantName() != null)
                .collect(Collectors.groupingBy(
                        receipt -> anonymizeMerchantName(receipt.getMerchantName()),
                        Collectors.counting()
                ));

        data.put("topMerchantTypes", merchantCounts);

        return data;
    }

    private String anonymizeMerchantName(String merchantName) {
        // Simple anonymization - group by merchant type
        String upperName = merchantName.toUpperCase();

        if (upperName.contains("RESTAURANT") || upperName.contains("CAFE") || upperName.contains("FOOD")) {
            return "FOOD_SERVICE";
        } else if (upperName.contains("GAS") || upperName.contains("FUEL") || upperName.contains("SHELL") || upperName.contains("EXXON")) {
            return "FUEL_STATION";
        } else if (upperName.contains("GROCERY") || upperName.contains("MARKET") || upperName.contains("SUPERMARKET")) {
            return "GROCERY_STORE";
        } else if (upperName.contains("PHARMACY") || upperName.contains("DRUG")) {
            return "PHARMACY";
        } else {
            return "OTHER_RETAIL";
        }
    }

    private CommunityInsight.StatisticalData createEmptyStatistics() {
        return CommunityInsight.StatisticalData.builder()
                .average(BigDecimal.ZERO)
                .median(BigDecimal.ZERO)
                .min(BigDecimal.ZERO)
                .max(BigDecimal.ZERO)
                .sampleSize(0L)
                .standardDeviation(0.0)
                .percentiles(new HashMap<>())
                .build();
    }

    private CommunityInsight createDefaultInsight() {
        return CommunityInsight.builder()
                .insightType("DEFAULT")
                .period("NONE")
                .title("No Data Available")
                .description("No community insights available at this time")
                .data(new HashMap<>())
                .statistics(createEmptyStatistics())
                .generatedAt(LocalDateTime.now())
                .validUntil(LocalDateTime.now().plusDays(1))
                .build();
    }
}
