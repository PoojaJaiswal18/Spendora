package com.jaiswal.controller;

import com.jaiswal.model.dto.ReportDTO;
import com.jaiswal.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<ReportDTO> getMonthlyReport(@RequestParam String userId, @RequestParam String month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(userId, month));
    }

    @GetMapping("/yearly")
    public ResponseEntity<ReportDTO> getYearlyReport(@RequestParam String userId, @RequestParam String year) {
        return ResponseEntity.ok(reportService.getYearlyReport(userId, year));
    }

    @PostMapping("/custom")
    public ResponseEntity<ReportDTO> getCustomReport(@RequestBody ReportDTO request) {
        return ResponseEntity.ok(reportService.getCustomReport(request));
    }

    @GetMapping("/tax")
    public ResponseEntity<ReportDTO> getTaxReport(@RequestParam String userId) {
        return ResponseEntity.ok(reportService.getTaxReport(userId));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport(@RequestParam String userId, @RequestParam String type) {
        byte[] file = reportService.exportReport(userId, type);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=report." + type)
                .body(file);
    }
}

