package com.jaiswal.service;

import com.jaiswal.model.dto.AnalyticsDTO;
import com.jaiswal.repository.ReceiptRepository;
import com.jaiswal.repository.CategoryRepository;
import com.jaiswal.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ReceiptRepository receiptRepository;
    private final CategoryRepository categoryRepository;

    @Cacheable(value = "analytics", key = "#userId + '_' + #startDate + '_' + #endDate")
    public AnalyticsDTO getAnalytics(String userId, LocalDate startDate, LocalDate endDate) {
        log.info("Generating analytics for user: {} from {} to {}", userId, startDate, endDate);

        return AnalyticsDTO.builder()
                .spendingSummary(generateSpendingSummary(userId, startDate, endDate))
                .categoryBreakdown(generateCategoryBreakdown(userId, startDate, endDate))
                .spendingTrends(generateSpendingTrends(userId, startDate, endDate))
                .monthlyComparisons(generateMonthlyComparisons(userId))
                .insights(generateInsights(userId, startDate, endDate))
                .build();
    }

    private AnalyticsDTO.SpendingSummary generateSpendingSummary(String userId, LocalDate startDate, LocalDate endDate) {
        var currentPeriodSummary = receiptRepository.getSpendingSummaryByUserAndDateRange(userId, startDate, endDate)
                .orElse(new SpendingSummaryDefault());

        LocalDate previousStart = startDate.minusMonths(1);
        LocalDate previousEnd = endDate.minusMonths(1);
        var previousPeriodSummary = receiptRepository.getSpendingSummaryByUserAndDateRange(userId, previousStart, previousEnd)
                .orElse(new SpendingSummaryDefault());

        BigDecimal currentTotal = currentPeriodSummary.getTotalAmount() != null ?
                currentPeriodSummary.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal previousTotal = previousPeriodSummary.getTotalAmount() != null ?
                previousPeriodSummary.getTotalAmount() : BigDecimal.ZERO;

        BigDecimal percentageChange = calculatePercentageChange(currentTotal, previousTotal);
        BigDecimal averagePerDay = calculateAveragePerDay(currentTotal, startDate, endDate);

        return AnalyticsDTO.SpendingSummary.builder()
                .totalThisMonth(currentTotal)
                .totalLastMonth(previousTotal)
                .totalThisYear(calculateYearlyTotal(userId))
                .averagePerDay(averagePerDay)
                .averagePerTransaction(currentPeriodSummary.getAvgAmount() != null ?
                        currentPeriodSummary.getAvgAmount() : BigDecimal.ZERO)
                .totalTransactions(currentPeriodSummary.getCount() != null ?
                        currentPeriodSummary.getCount() : 0)
                .percentageChange(percentageChange)
                .build();
    }

    private List<AnalyticsDTO.CategoryBreakdown> generateCategoryBreakdown(String userId, LocalDate startDate, LocalDate endDate) {
        var categorySpending = receiptRepository.getCategorySpendingByUserAndDateRange(userId, startDate, endDate);
        var categories = categoryRepository.findByUserIdOrUserIdIsNullOrderByNameAsc(userId)
                .stream()
                .collect(Collectors.toMap(cat -> cat.getId(), cat -> cat));

        BigDecimal totalSpending = categorySpending.stream()
                .map(ReceiptRepository.CategorySpendingAggregation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return categorySpending.stream()
                .map(spending -> {
                    var category = categories.get(spending.get_id());
                    double percentage = totalSpending.compareTo(BigDecimal.ZERO) > 0 ?
                            spending.getTotalAmount().divide(totalSpending, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

                    return AnalyticsDTO.CategoryBreakdown.builder()
                            .categoryId(spending.get_id())
                            .categoryName(category != null ? category.getName() : "Unknown")
                            .categoryColor(category != null ? category.getColor() : "#6366f1")
                            .amount(spending.getTotalAmount())
                            .percentage(percentage)
                            .transactionCount(spending.getCount())
                            .build();
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());
    }

    private List<AnalyticsDTO.SpendingTrend> generateSpendingTrends(String userId, LocalDate startDate, LocalDate endDate) {
        var dailySpending = receiptRepository.getDailySpendingByUserAndDateRange(userId, startDate, endDate);

        return dailySpending.stream()
                .map(daily -> AnalyticsDTO.SpendingTrend.builder()
                        .date(LocalDate.parse(daily.get_id()))
                        .amount(daily.getTotalAmount())
                        .transactionCount(daily.getCount())
                        .build())
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());
    }

    private List<AnalyticsDTO.MonthlyComparison> generateMonthlyComparisons(String userId) {
        List<AnalyticsDTO.MonthlyComparison> comparisons = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 0; i < 12; i++) {
            LocalDate currentMonth = now.minusMonths(i);
            LocalDate previousYearMonth = currentMonth.minusYears(1);

            BigDecimal currentYearAmount = getMonthlyTotal(userId, currentMonth);
            BigDecimal previousYearAmount = getMonthlyTotal(userId, previousYearMonth);

            double changePercentage = calculatePercentageChange(currentYearAmount, previousYearAmount).doubleValue();

            comparisons.add(AnalyticsDTO.MonthlyComparison.builder()
                    .month(currentMonth.getMonth().name())
                    .currentYear(currentYearAmount)
                    .previousYear(previousYearAmount)
                    .changePercentage(changePercentage)
                    .build());
        }

        return comparisons;
    }

    private List<AnalyticsDTO.InsightData> generateInsights(String userId, LocalDate startDate, LocalDate endDate) {
        List<AnalyticsDTO.InsightData> insights = new ArrayList<>();

        // Top spending category insight
        var categoryBreakdown = generateCategoryBreakdown(userId, startDate, endDate);
        if (!categoryBreakdown.isEmpty()) {
            var topCategory = categoryBreakdown.get(0);
            insights.add(AnalyticsDTO.InsightData.builder()
                    .type("TOP_CATEGORY")
                    .title("Top Spending Category")
                    .description(String.format("You spent %.1f%% of your budget on %s",
                            topCategory.getPercentage(), topCategory.getCategoryName()))
                    .icon("📊")
                    .data(Map.of("category", topCategory.getCategoryName(),
                            "percentage", topCategory.getPercentage()))
                    .build());
        }

        // Spending trend insight
        var trends = generateSpendingTrends(userId, startDate, endDate);
        if (trends.size() >= 7) {
            BigDecimal recentWeekAvg = trends.subList(trends.size() - 7, trends.size())
                    .stream()
                    .map(AnalyticsDTO.SpendingTrend::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(7), 2, RoundingMode.HALF_UP);

            insights.add(AnalyticsDTO.InsightData.builder()
                    .type("SPENDING_TREND")
                    .title("Weekly Average")
                    .description(String.format("Your average daily spending this week is $%.2f", recentWeekAvg))
                    .icon("📈")
                    .data(Map.of("weeklyAverage", recentWeekAvg))
                    .build());
        }

        return insights;
    }

    private BigDecimal calculatePercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal calculateAveragePerDay(BigDecimal total, LocalDate startDate, LocalDate endDate) {
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        return total.divide(BigDecimal.valueOf(daysBetween), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateYearlyTotal(String userId) {
        LocalDate startOfYear = LocalDate.now().withDayOfYear(1);
        LocalDate endOfYear = LocalDate.now().withDayOfYear(LocalDate.now().lengthOfYear());

        return receiptRepository.getSpendingSummaryByUserAndDateRange(userId, startOfYear, endOfYear)
                .map(summary -> summary.getTotalAmount() != null ? summary.getTotalAmount() : BigDecimal.ZERO)
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal getMonthlyTotal(String userId, LocalDate month) {
        LocalDate startOfMonth = month.withDayOfMonth(1);
        LocalDate endOfMonth = month.withDayOfMonth(month.lengthOfMonth());

        return receiptRepository.getSpendingSummaryByUserAndDateRange(userId, startOfMonth, endOfMonth)
                .map(summary -> summary.getTotalAmount() != null ? summary.getTotalAmount() : BigDecimal.ZERO)
                .orElse(BigDecimal.ZERO);
    }

    // Default implementation for aggregation interface
    private static class SpendingSummaryDefault implements ReceiptRepository.SpendingSummaryAggregation {
        @Override
        public BigDecimal getTotalAmount() { return BigDecimal.ZERO; }

        @Override
        public BigDecimal getAvgAmount() { return BigDecimal.ZERO; }

        @Override
        public Integer getCount() { return 0; }
    }
}

