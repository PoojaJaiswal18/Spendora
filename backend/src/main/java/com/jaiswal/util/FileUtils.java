package com.jaiswal.util;

import com.jaiswal.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Component
public class FileUtils {

    @Value("${app.upload.receipt-images:./uploads/receipts}")
    private String receiptUploadPath;

    @Value("${app.upload.base-url:http://localhost:8080}")
    private String baseUrl;

    public String saveReceiptImage(MultipartFile file, String userId) throws IOException {
        validateFile(file, new String[]{"jpg", "jpeg", "png", "pdf"}, 10485760L); // 10MB

        String extension = getFileExtension(file.getOriginalFilename());
        String filename = generateUniqueFilename(extension);
        String userDir = receiptUploadPath + "/" + userId;

        Path dir = Paths.get(userDir);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }

        Path filePath = dir.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = baseUrl + "/api/files/receipts/" + userId + "/" + filename;
        log.info("Saved receipt image: {}", imageUrl);

        return imageUrl;
    }

    public static String saveFile(MultipartFile file, String uploadDir) throws IOException {
        String extension = getFileExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "." + extension;

        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }

        Path path = dir.resolve(filename);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        return path.toString();
    }

    public static void validateFile(MultipartFile file, String[] allowedTypes, long maxSizeBytes) {
        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new InvalidFileException("File too large. Maximum size: " + (maxSizeBytes / 1024 / 1024) + "MB");
        }

        String ext = getFileExtension(file.getOriginalFilename());
        boolean allowed = false;
        for (String type : allowedTypes) {
            if (type.equalsIgnoreCase(ext)) {
                allowed = true;
                break;
            }
        }

        if (!allowed) {
            throw new InvalidFileException("File type not allowed. Allowed types: " + String.join(", ", allowedTypes));
        }
    }

    public static String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int idx = filename.lastIndexOf('.');
        return idx > 0 ? filename.substring(idx + 1) : "";
    }

    private String generateUniqueFilename(String extension) {
        return UUID.randomUUID() + "_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) +
                "." + extension;
    }
}
