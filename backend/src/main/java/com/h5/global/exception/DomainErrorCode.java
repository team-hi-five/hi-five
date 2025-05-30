package com.h5.global.exception;

import com.github.hyeonjaez.springcommon.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public enum DomainErrorCode implements ErrorCode {

    ACCESS_TOKEN_NOTFOUND(HttpStatus.NOT_FOUND, "AUTH-001", "Access Token Not Found"),

    ;

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    DomainErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}