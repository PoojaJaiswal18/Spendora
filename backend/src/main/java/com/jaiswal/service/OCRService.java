package com.jaiswal.service;

import com.jaiswal.exception.OCRProcessingException;
import com.jaiswal.model.document.Receipt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class OCRService {

    @Value("${app.ocr.tesseract-path:C:/Program Files/Tesseract-OCR/tesseract.exe}")
    private String tesseractPath;

    @Value("${app.ocr.temp-dir:${java.io.tmpdir}/ocr}")
    private String tempDir;

    private static final Pattern AMOUNT_PATTERN = Pattern.compile("\\$?([0-9]+\\.?[0-9]{0,2})");
    private static final Pattern DATE_PATTERN = Pattern.compile("(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})");
    private static final Pattern MERCHANT_PATTERN = Pattern.compile("^([A-Z][A-Z\\s&'.-]+)");

    public CompletableFuture<Receipt.OCRData> processReceiptImage(MultipartFile file) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Starting OCR processing for file: {}", file.getOriginalFilename());

                // Save temporary file
                Path tempFile = saveTemporaryFile(file);

                // Preprocess image
                Path processedFile = preprocessImage(tempFile);

                // Extract text using Tesseract
                String extractedText = extractTextWithTesseract(processedFile);

                // Clean up temporary files
                cleanupTempFiles(tempFile, processedFile);

                // Calculate confidence score
                double confidence = calculateConfidence(extractedText);

                log.info("OCR processing completed with confidence: {}", confidence);

                return Receipt.OCRData.builder()
                        .extractedText(extractedText)
                        .confidence(confidence)
                        .processedAt(LocalDateTime.now())
                        .ocrEngine("Tesseract")
                        .rawData(parseRawData(extractedText))
                        .build();

            } catch (Exception e) {
                log.error("Error during OCR processing", e);
                throw new OCRProcessingException("Failed to process receipt image", e);
            }
        });
    }

    public ParsedReceiptData parseReceiptData(String extractedText) {
        log.info("Parsing receipt data from extracted text");

        return ParsedReceiptData.builder()
                .merchantName(extractMerchantName(extractedText))
                .totalAmount(extractTotalAmount(extractedText))
                .date(extractDate(extractedText))
                .items(extractItems(extractedText))
                .paymentInfo(extractPaymentInfo(extractedText))
                .build();
    }

    private Path saveTemporaryFile(MultipartFile file) throws IOException {
        Files.createDirectories(Path.of(tempDir));
        Path tempFile = Path.of(tempDir, "receipt_" + System.currentTimeMillis() + "_" + file.getOriginalFilename());
        Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
        return tempFile;
    }

    private Path preprocessImage(Path inputFile) throws IOException, InterruptedException {
        Path outputFile = Path.of(tempDir, "processed_" + inputFile.getFileName());

        // Use ImageMagick to enhance image quality (if available)
        ProcessBuilder pb = new ProcessBuilder(
                "magick", // Updated for newer ImageMagick versions
                inputFile.toString(),
                "-density", "300",
                "-type", "Grayscale",
                "-contrast-stretch", "0",
                "-normalize",
                "-sharpen", "0x1",
                outputFile.toString()
        );

        try {
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                log.warn("ImageMagick preprocessing failed, using original image");
                return inputFile;
            }

            return outputFile;
        } catch (IOException e) {
            log.warn("ImageMagick not available, using original image: {}", e.getMessage());
            return inputFile;
        }
    }

    private String extractTextWithTesseract(Path imageFile) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                tesseractPath,
                imageFile.toString(),
                "stdout",
                "-l", "eng",
                "--psm", "6",
                "-c", "tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/$-:"
        );

        Process process = pb.start();
        StringBuilder output = new StringBuilder();

        try (var reader = process.inputReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new OCRProcessingException("Tesseract OCR failed with exit code: " + exitCode);
        }

        return output.toString().trim();
    }

    private String extractMerchantName(String text) {
        String[] lines = text.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.length() > 3 && line.length() < 50) {
                Matcher matcher = MERCHANT_PATTERN.matcher(line.toUpperCase());
                if (matcher.find()) {
                    return matcher.group(1).trim();
                }
            }
        }
        return "Unknown Merchant";
    }

    private BigDecimal extractTotalAmount(String text) {
        List<BigDecimal> amounts = new ArrayList<>();
        Matcher matcher = AMOUNT_PATTERN.matcher(text);

        while (matcher.find()) {
            try {
                BigDecimal amount = new BigDecimal(matcher.group(1));
                if (amount.compareTo(BigDecimal.ZERO) > 0 && amount.compareTo(BigDecimal.valueOf(10000)) < 0) {
                    amounts.add(amount);
                }
            } catch (NumberFormatException e) {
                // Ignore invalid numbers
            }
        }

        // Return the largest amount found (likely the total)
        return amounts.stream()
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    private LocalDate extractDate(String text) {
        Matcher matcher = DATE_PATTERN.matcher(text);
        while (matcher.find()) {
            String dateStr = matcher.group(1);
            try {
                // Try different date formats
                for (String pattern : List.of("M/d/yyyy", "MM/dd/yyyy", "M-d-yyyy", "MM-dd-yyyy", "M/d/yy", "MM/dd/yy")) {
                    try {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
                        return LocalDate.parse(dateStr, formatter);
                    } catch (Exception e) {
                        // Try next pattern
                    }
                }
            } catch (Exception e) {
                // Continue searching
            }
        }
        return LocalDate.now(); // Default to today if no date found
    }

    private List<Receipt.ReceiptItem> extractItems(String text) {
        List<Receipt.ReceiptItem> items = new ArrayList<>();
        String[] lines = text.split("\n");

        for (String line : lines) {
            line = line.trim();
            if (line.length() > 3 && containsAmount(line)) {
                Matcher amountMatcher = AMOUNT_PATTERN.matcher(line);
                if (amountMatcher.find()) {
                    String itemName = line.substring(0, amountMatcher.start()).trim();
                    BigDecimal price = new BigDecimal(amountMatcher.group(1));

                    if (!itemName.isEmpty() && price.compareTo(BigDecimal.ZERO) > 0) {
                        items.add(Receipt.ReceiptItem.builder()
                                .name(itemName)
                                .quantity(1)
                                .unitPrice(price)
                                .totalPrice(price)
                                .build());
                    }
                }
            }
        }
        return items;
    }

    private Receipt.PaymentInfo extractPaymentInfo(String text) {
        String upperText = text.toUpperCase();
        String method = "UNKNOWN";

        if (upperText.contains("CASH")) {
            method = "CASH";
        } else if (upperText.contains("CARD") || upperText.contains("VISA") || upperText.contains("MASTERCARD")) {
            method = "CARD";
        } else if (upperText.contains("DEBIT")) {
            method = "DEBIT";
        }

        return Receipt.PaymentInfo.builder()
                .method(method)
                .build();
    }

    private double calculateConfidence(String extractedText) {
        if (extractedText == null || extractedText.trim().isEmpty()) {
            return 0.0;
        }

        double score = 0.0;

        // Check for common receipt elements
        if (containsAmount(extractedText)) score += 0.3;
        if (containsDate(extractedText)) score += 0.2;
        if (extractedText.length() > 50) score += 0.2;
        if (extractedText.split("\n").length > 5) score += 0.1;

        // Check for receipt keywords
        String upperText = extractedText.toUpperCase();
        if (upperText.contains("TOTAL")) score += 0.1;
        if (upperText.contains("TAX")) score += 0.05;
        if (upperText.contains("RECEIPT")) score += 0.05;

        return Math.min(score, 1.0);
    }

    private boolean containsAmount(String text) {
        return AMOUNT_PATTERN.matcher(text).find();
    }

    private boolean containsDate(String text) {
        return DATE_PATTERN.matcher(text).find();
    }

    private Map<String, Object> parseRawData(String extractedText) {
        Map<String, Object> rawData = new HashMap<>();
        rawData.put("lineCount", extractedText.split("\n").length);
        rawData.put("characterCount", extractedText.length());
        rawData.put("wordCount", extractedText.split("\\s+").length);
        rawData.put("extractedAt", LocalDateTime.now().toString());
        return rawData;
    }

    private void cleanupTempFiles(Path... files) {
        for (Path file : files) {
            try {
                Files.deleteIfExists(file);
            } catch (IOException e) {
                log.warn("Failed to delete temporary file: {}", file, e);
            }
        }
    }

    // Separate class for parsed receipt data
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ParsedReceiptData {
        private String merchantName;
        private BigDecimal totalAmount;
        private LocalDate date;
        private List<Receipt.ReceiptItem> items;
        private Receipt.PaymentInfo paymentInfo;
    }
}
