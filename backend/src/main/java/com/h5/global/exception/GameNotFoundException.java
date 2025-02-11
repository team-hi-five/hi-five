package com.h5.global.exception;

import org.springframework.http.HttpStatus;

public class GameNotFoundException extends RuntimeException {
    private final HttpStatus status;

    public GameNotFoundException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
