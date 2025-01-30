package com.h5.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

//잘못된 사용자 입력 또는 요청 데이터의 문제로 인해 예외 400
@Getter
public class InvalidUserException extends RuntimeException {
    private final HttpStatus status;

    public InvalidUserException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

}
