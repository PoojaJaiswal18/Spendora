package com.jaiswal.util;

import com.jaiswal.exception.InvalidFileException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class FileUtils {
    public static String saveFile(MultipartFile file, String uploadDir) throws IOException {
        String extension = getFileExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "." + extension;
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Path path = dir.resolve(filename);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        return path.toString();
    }

    public static void validateFile(MultipartFile file, String[] allowedTypes, long maxSizeBytes) {
        if (file.isEmpty()) throw new InvalidFileException("File is empty");
        if (file.getSize() > maxSizeBytes) throw new InvalidFileException("File too large");
        String ext = getFileExtension(file.getOriginalFilename());
        boolean allowed = false;
        for (String type : allowedTypes) {
            if (type.equalsIgnoreCase(ext)) {
                allowed = true;
                break;
            }
        }
        if (!allowed) throw new InvalidFileException("File type not allowed");
    }

    public static String getFileExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        return idx > 0 ? filename.substring(idx + 1) : "";
    }
}

