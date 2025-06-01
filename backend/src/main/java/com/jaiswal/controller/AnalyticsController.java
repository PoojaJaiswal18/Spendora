package com.jaiswal.controller;

import com.jaiswal.model.dto.AnalyticsDTO;
import com.jaiswal.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/spending-trends")
    public ResponseEntity<AnalyticsDTO> getSpendingTrends(@RequestParam String userId) {
        return ResponseEntity.ok(analyticsService.getSpendingTrends(userId));
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<AnalyticsDTO> getCategoryBreakdown(@RequestParam String userId) {
        return ResponseEntity.ok(analyticsService.getCategoryBreakdown(userId));
    }

    @GetMapping("/monthly-comparison")
    public ResponseEntity<AnalyticsDTO> getMonthlyComparison(@RequestParam String userId) {
        return ResponseEntity.ok(analyticsService.getMonthlyComparison(userId));
    }

    @GetMapping("/insights")
    public ResponseEntity<AnalyticsDTO> getInsights(@RequestParam String userId) {
        return ResponseEntity.ok(analyticsService.getInsights(userId));
    }
}

