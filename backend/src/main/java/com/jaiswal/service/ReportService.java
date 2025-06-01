package com.jaiswal.service;

import com.jaiswal.model.dto.ReportDTO;
import com.jaiswal.model.document.Receipt;
import com.jaiswal.repository.ReceiptRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReceiptRepository receiptRepository;

    @Autowired
    public ReportService(ReceiptRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    @Cacheable(value = "monthlyReports", key = "#userId + '-' + #month")
    public ReportDTO getMonthlyReport(String userId, String month) {
        List<Receipt> receipts = receiptRepository.findByUserIdAndMonth(userId, month);
        return aggregateReport(receipts, "Monthly", month);
    }

    @Cacheable(value = "yearlyReports", key = "#userId + '-' + #year")
    public ReportDTO getYearlyReport(String userId, String year) {
        List<Receipt> receipts = receiptRepository.findByUserIdAndYear(userId, year);
        return aggregateReport(receipts, "Yearly", year);
    }

    public ReportDTO getCustomReport(ReportDTO request) {
        List<Receipt> receipts = receiptRepository.findCustom(request.getUserId(), request.getStartDate(), request.getEndDate());
        return aggregateReport(receipts, "Custom", null);
    }

    @Cacheable(value = "taxReports", key = "#userId")
    public ReportDTO getTaxReport(String userId) {
        List<Receipt> receipts = receiptRepository.findTaxRelevant(userId);
        return aggregateReport(receipts, "Tax", null);
    }

    public byte[] exportReport(String userId, String type) {
        List<Receipt> receipts = receiptRepository.findByUserId(userId);
        try {
            InputStream templateStream = new ClassPathResource("reports/financial_report.jrxml").getInputStream();
            JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(receipts);
            Map<String, Object> params = new HashMap<>();
            params.put("REPORT_TITLE", "Financial Report");
            JasperPrint print = JasperFillManager.fillReport(jasperReport, params, dataSource);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            if ("pdf".equalsIgnoreCase(type)) {
                JasperExportManager.exportReportToPdfStream(print, out);
            } else if ("xlsx".equalsIgnoreCase(type)) {
                // Use JasperReports XLSX exporter
                // (Add dependency and implement as needed)
            }
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export report: " + e.getMessage(), e);
        }
    }

    // Helper method to aggregate data and map to DTO
    private ReportDTO aggregateReport(List<Receipt> receipts, String reportType, String period) {
        ReportDTO dto = new ReportDTO();
        dto.setReportType(reportType);
        dto.setPeriod(period);
        dto.setTotalAmount(receipts.stream().mapToDouble(Receipt::getAmount).sum());
        dto.setCategoryBreakdown(receipts.stream()
                .collect(Collectors.groupingBy(Receipt::getCategory,
                        Collectors.summingDouble(Receipt::getAmount))));
        dto.setReceipts(receipts.stream().map(ReceiptDTO::from).collect(Collectors.toList()));
        return dto;
    }
}

