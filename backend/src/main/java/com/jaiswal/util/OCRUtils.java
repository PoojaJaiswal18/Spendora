package com.jaiswal.util;

public class OCRUtils {
    public static String cleanExtractedText(String text) {
        return text.replaceAll("[^\\x00-\\x7F]", "").trim();
    }
}

