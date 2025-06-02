package com.jaiswal.util;

import lombok.extern.slf4j.Slf4j;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;

@Slf4j
public class OCRUtils {

    private static final Pattern AMOUNT_PATTERN = Pattern.compile("\\$?([0-9]+\\.?[0-9]{0,2})");
    private static final Pattern DATE_PATTERN = Pattern.compile("(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    public static String cleanExtractedText(String text) {
        if (text == null) {
            return "";
        }

        return text.replaceAll("[^\\x00-\\x7F]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public static List<String> extractAmounts(String text) {
        List<String> amounts = new ArrayList<>();
        Matcher matcher = AMOUNT_PATTERN.matcher(text);

        while (matcher.find()) {
            amounts.add(matcher.group(1));
        }

        return amounts;
    }

    public static List<String> extractDates(String text) {
        List<String> dates = new ArrayList<>();
        Matcher matcher = DATE_PATTERN.matcher(text);

        while (matcher.find()) {
            dates.add(matcher.group(1));
        }

        return dates;
    }

    public static List<String> extractPhoneNumbers(String text) {
        List<String> phoneNumbers = new ArrayList<>();
        Matcher matcher = PHONE_PATTERN.matcher(text);

        while (matcher.find()) {
            phoneNumbers.add(matcher.group());
        }

        return phoneNumbers;
    }

    public static List<String> extractEmails(String text) {
        List<String> emails = new ArrayList<>();
        Matcher matcher = EMAIL_PATTERN.matcher(text);

        while (matcher.find()) {
            emails.add(matcher.group());
        }

        return emails;
    }

    public static double calculateConfidence(String extractedText) {
        if (extractedText == null || extractedText.trim().isEmpty()) {
            return 0.0;
        }

        double score = 0.0;

        // Check for amounts
        if (!extractAmounts(extractedText).isEmpty()) {
            score += 0.3;
        }

        // Check for dates
        if (!extractDates(extractedText).isEmpty()) {
            score += 0.2;
        }

        // Check text length
        if (extractedText.length() > 50) {
            score += 0.2;
        }

        // Check line count
        if (extractedText.split("\n").length > 5) {
            score += 0.1;
        }

        // Check for receipt keywords
        String upperText = extractedText.toUpperCase();
        if (upperText.contains("TOTAL")) score += 0.1;
        if (upperText.contains("TAX")) score += 0.05;
        if (upperText.contains("RECEIPT")) score += 0.05;

        return Math.min(score, 1.0);
    }

    private OCRUtils() {
        // Utility class
    }
}
