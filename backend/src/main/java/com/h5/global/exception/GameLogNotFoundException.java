package com.h5.global.exception;

import org.springframework.http.HttpStatus;

public class GameLogNotFoundException extends RuntimeException {
    private HttpStatus status;

    public GameLogNotFoundException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
