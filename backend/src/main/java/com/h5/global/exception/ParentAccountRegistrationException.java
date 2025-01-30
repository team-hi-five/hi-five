package com.h5.global.exception;

public class ParentAccountRegistrationException extends RuntimeException {
    public ParentAccountRegistrationException(String message) {
        super(message);
    }

    public ParentAccountRegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}

