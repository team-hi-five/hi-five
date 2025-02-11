package com.h5.global.exception;

import org.springframework.http.HttpStatus;

public class StatisticNotFoundException extends RuntimeException {
    private HttpStatus status;

    public StatisticNotFoundException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
