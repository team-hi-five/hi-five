package com.h5.global.exception;

import org.springframework.http.HttpStatus;

public class ChildGameNotFoundException extends RuntimeException {
    private final HttpStatus status;

    public ChildGameNotFoundException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
