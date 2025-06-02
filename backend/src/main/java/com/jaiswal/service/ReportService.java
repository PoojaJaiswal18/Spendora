package com.jaiswal.service;

import com.jaiswal.model.dto.ReportDTO;
import com.jaiswal.model.dto.ReceiptDTO;
import com.jaiswal.model.document.Receipt;
import com.jaiswal.repository.ReceiptRepository;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ReportService {

    private final ReceiptRepository receiptRepository;

    @Autowired
    public ReportService(ReceiptRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    @Cacheable(value = "monthlyReports", key = "#userId + '-' + #month")
    public ReportDTO getMonthlyReport(String userId, String month) {
        try {
            int monthInt = Integer.parseInt(month);
            List<Receipt> receipts = receiptRepository.findByUserIdAndMonth(userId, monthInt);
            return aggregateReport(receipts, "Monthly", month, userId);
        } catch (NumberFormatException e) {
            log.error("Invalid month format: {}", month, e);
            throw new IllegalArgumentException("Invalid month format: " + month);
        }
    }

    @Cacheable(value = "yearlyReports", key = "#userId + '-' + #year")
    public ReportDTO getYearlyReport(String userId, String year) {
        try {
            int yearInt = Integer.parseInt(year);
            List<Receipt> receipts = receiptRepository.findByUserIdAndYear(userId, yearInt);
            return aggregateReport(receipts, "Yearly", year, userId);
        } catch (NumberFormatException e) {
            log.error("Invalid year format: {}", year, e);
            throw new IllegalArgumentException("Invalid year format: " + year);
        }
    }

    public ReportDTO getCustomReport(ReportDTO request) {
        if (request.getUserId() == null || request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("UserId, startDate, and endDate are required for custom reports");
        }

        List<Receipt> receipts = receiptRepository.findCustom(
                request.getUserId(),
                request.getStartDate(),
                request.getEndDate()
        );
        return aggregateReport(receipts, "Custom", null, request.getUserId());
    }

    @Cacheable(value = "taxReports", key = "#userId")
    public ReportDTO getTaxReport(String userId) {
        List<Receipt> receipts = receiptRepository.findTaxRelevant(userId);
        return aggregateReport(receipts, "Tax", null, userId);
    }

    public byte[] exportReport(String userId, String type) {
        List<Receipt> receipts = receiptRepository.findByUserId(userId);

        try {
            InputStream templateStream = new ClassPathResource("reports/financial_report.jrxml").getInputStream();
            JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

            // Convert receipts to DTOs for JasperReports
            List<ReceiptDTO> receiptDTOs = receipts.stream()
                    .map(ReceiptDTO::from)
                    .collect(Collectors.toList());

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(receiptDTOs);

            Map<String, Object> params = new HashMap<>();
            params.put("REPORT_TITLE", "Financial Report");
            params.put("USER_ID", userId);
            params.put("GENERATED_DATE", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));

            JasperPrint print = JasperFillManager.fillReport(jasperReport, params, dataSource);

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            if ("pdf".equalsIgnoreCase(type)) {
                JasperExportManager.exportReportToPdfStream(print, out);
            } else if ("xlsx".equalsIgnoreCase(type)) {
                JRXlsxExporter exporter = new JRXlsxExporter();
                exporter.setExporterInput(new SimpleExporterInput(print));
                exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(out));

                SimpleXlsxReportConfiguration configuration = new SimpleXlsxReportConfiguration();
                configuration.setOnePagePerSheet(false);
                configuration.setDetectCellType(true);
                exporter.setConfiguration(configuration);

                exporter.exportReport();
            } else {
                throw new IllegalArgumentException("Unsupported export type: " + type);
            }

            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to export report for user: {}", userId, e);
            throw new RuntimeException("Failed to export report: " + e.getMessage(), e);
        }
    }

    // Helper method to aggregate data and map to DTO
    private ReportDTO aggregateReport(List<Receipt> receipts, String reportType, String period, String userId) {
        if (receipts == null || receipts.isEmpty()) {
            return createEmptyReport(reportType, period, userId);
        }

        // Calculate total amount
        BigDecimal totalAmount = receipts.stream()
                .map(Receipt::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate category breakdown
        Map<String, BigDecimal> categoryBreakdown = receipts.stream()
                .filter(receipt -> receipt.getCategoryId() != null)
                .collect(Collectors.groupingBy(
                        receipt -> receipt.getCategoryId() != null ? receipt.getCategoryId() : "Uncategorized",
                        Collectors.reducing(BigDecimal.ZERO, Receipt::getTotalAmount, BigDecimal::add)
                ));

        // Convert receipts to DTOs
        List<ReceiptDTO> receiptDTOs = receipts.stream()
                .map(ReceiptDTO::from)
                .collect(Collectors.toList());

        // Build summary
        ReportDTO.ReportSummary summary = ReportDTO.ReportSummary.builder()
                .totalAmount(totalAmount)
                .totalTransactions(receipts.size())
                .averageTransaction(receipts.isEmpty() ? BigDecimal.ZERO :
                        totalAmount.divide(BigDecimal.valueOf(receipts.size()), 2, BigDecimal.ROUND_HALF_UP))
                .topCategory(findTopCategory(categoryBreakdown))
                .topMerchant(findTopMerchant(receipts))
                .categoryTotals(categoryBreakdown)
                .build();

        return ReportDTO.builder()
                .reportId(UUID.randomUUID().toString())
                .reportType(reportType)
                .title(reportType + " Financial Report")
                .userId(userId)
                .period(period)
                .generatedAt(LocalDate.now())
                .totalAmount(totalAmount)
                .categoryBreakdown(categoryBreakdown)
                .receipts(receiptDTOs)
                .summary(summary)
                .metadata(createMetadata(receipts))
                .build();
    }

    private ReportDTO createEmptyReport(String reportType, String period, String userId) {
        return ReportDTO.builder()
                .reportId(UUID.randomUUID().toString())
                .reportType(reportType)
                .title(reportType + " Financial Report")
                .userId(userId)
                .period(period)
                .generatedAt(LocalDate.now())
                .totalAmount(BigDecimal.ZERO)
                .categoryBreakdown(new HashMap<>())
                .receipts(new ArrayList<>())
                .summary(ReportDTO.ReportSummary.builder()
                        .totalAmount(BigDecimal.ZERO)
                        .totalTransactions(0)
                        .averageTransaction(BigDecimal.ZERO)
                        .categoryTotals(new HashMap<>())
                        .build())
                .metadata(new HashMap<>())
                .build();
    }

    private String findTopCategory(Map<String, BigDecimal> categoryBreakdown) {
        return categoryBreakdown.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }

    private String findTopMerchant(List<Receipt> receipts) {
        Map<String, BigDecimal> merchantTotals = receipts.stream()
                .filter(receipt -> receipt.getMerchantName() != null)
                .collect(Collectors.groupingBy(
                        Receipt::getMerchantName,
                        Collectors.reducing(BigDecimal.ZERO, Receipt::getTotalAmount, BigDecimal::add)
                ));

        return merchantTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }

    private Map<String, Object> createMetadata(List<Receipt> receipts) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("totalReceipts", receipts.size());
        metadata.put("dateRange", getDateRange(receipts));
        metadata.put("generatedAt", LocalDate.now().toString());
        return metadata;
    }

    private String getDateRange(List<Receipt> receipts) {
        if (receipts.isEmpty()) {
            return "No data";
        }

        Optional<LocalDate> minDate = receipts.stream()
                .map(Receipt::getDate)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo);

        Optional<LocalDate> maxDate = receipts.stream()
                .map(Receipt::getDate)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo);

        if (minDate.isPresent() && maxDate.isPresent()) {
            return minDate.get().toString() + " to " + maxDate.get().toString();
        }

        return "Unknown range";
    }
}
