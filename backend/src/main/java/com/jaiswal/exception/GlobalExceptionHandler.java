package com.jaiswal.exception;

import com.jaiswal.model.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.validation.ConstraintViolationException;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<?> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage(), "NOT_FOUND");
    }

    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleAuthentication(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage(), "AUTH_ERROR");
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Bad credentials: {}", ex.getMessage());
        return ApiResponse.error("Invalid username or password.", "BAD_CREDENTIALS");
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<?> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ApiResponse.error("You do not have permission to access this resource.", "FORBIDDEN");
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleValidation(ValidationException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage(), "VALIDATION_ERROR");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleMethodArgNotValid(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ApiResponse.error(msg, "VALIDATION_ERROR");
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleConstraintViolation(ConstraintViolationException ex) {
        return ApiResponse.error(ex.getMessage(), "VALIDATION_ERROR");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return ApiResponse.error("Malformed JSON request.", "BAD_REQUEST");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    public ApiResponse<?> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ApiResponse.error("File size exceeds the maximum allowed.", "FILE_TOO_LARGE");
    }

    @ExceptionHandler(OCRProcessingException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleOCRProcessing(OCRProcessingException ex) {
        return ApiResponse.error("OCR processing failed: " + ex.getMessage(), "OCR_ERROR");
    }

    @ExceptionHandler(InvalidFileException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleInvalidFile(InvalidFileException ex) {
        return ApiResponse.error("Invalid file: " + ex.getMessage(), "INVALID_FILE");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<?> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ApiResponse.builder()
                .success(false)
                .message("Internal server error")
                .errorCode("INTERNAL_ERROR")
                .timestamp(LocalDateTime.now())
                .build();
    }
}

