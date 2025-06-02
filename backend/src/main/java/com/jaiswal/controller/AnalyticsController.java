package com.jaiswal.controller;

import com.jaiswal.model.dto.AnalyticsDTO;
import com.jaiswal.model.dto.ApiResponse;
import com.jaiswal.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Validated
@Tag(name = "Analytics", description = "APIs for financial analytics and insights")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get comprehensive analytics", description = "Get complete analytics data for a date range")
    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getAnalytics(
            @Parameter(description = "Start date for analytics")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for analytics")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Default to current month if dates not provided
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        AnalyticsDTO analytics = analyticsService.getAnalytics(getUserId(userDetails), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Analytics data retrieved successfully", analytics));
    }

    @Operation(summary = "Get spending trends", description = "Get daily spending trends for the specified period")
    @GetMapping("/spending-trends")
    public ResponseEntity<ApiResponse<List<AnalyticsDTO.SpendingTrend>>> getSpendingTrends(
            @Parameter(description = "Start date for trends")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for trends")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<AnalyticsDTO.SpendingTrend> trends = analyticsService.getSpendingTrends(getUserId(userDetails), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Spending trends retrieved successfully", trends));
    }

    @Operation(summary = "Get category breakdown", description = "Get spending breakdown by categories")
    @GetMapping("/category-breakdown")
    public ResponseEntity<ApiResponse<List<AnalyticsDTO.CategoryBreakdown>>> getCategoryBreakdown(
            @Parameter(description = "Start date for breakdown")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for breakdown")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<AnalyticsDTO.CategoryBreakdown> breakdown = analyticsService.getCategoryBreakdown(getUserId(userDetails), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Category breakdown retrieved successfully", breakdown));
    }

    @Operation(summary = "Get monthly comparison", description = "Get month-over-month spending comparison")
    @GetMapping("/monthly-comparison")
    public ResponseEntity<ApiResponse<List<AnalyticsDTO.MonthlyComparison>>> getMonthlyComparison(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<AnalyticsDTO.MonthlyComparison> comparison = analyticsService.getMonthlyComparison(getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Monthly comparison retrieved successfully", comparison));
    }

    @Operation(summary = "Get insights", description = "Get personalized financial insights")
    @GetMapping("/insights")
    public ResponseEntity<ApiResponse<List<AnalyticsDTO.InsightData>>> getInsights(
            @Parameter(description = "Start date for insights")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for insights")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<AnalyticsDTO.InsightData> insights = analyticsService.getInsights(getUserId(userDetails), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Insights retrieved successfully", insights));
    }

    @Operation(summary = "Get spending summary", description = "Get spending summary for the current period")
    @GetMapping("/spending-summary")
    public ResponseEntity<ApiResponse<AnalyticsDTO.SpendingSummary>> getSpendingSummary(
            @Parameter(description = "Start date for summary")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for summary")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        AnalyticsDTO analytics = analyticsService.getAnalytics(getUserId(userDetails), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Spending summary retrieved successfully", analytics.getSpendingSummary()));
    }

    private String getUserId(UserDetails userDetails) {
        return ((com.jaiswal.model.document.User) userDetails).getId();
    }
}
