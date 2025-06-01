package com.jaiswal.exception;

public class ReceiptNotFoundException extends ResourceNotFoundException {
    public ReceiptNotFoundException(String message) {
        super(message);
    }
}

