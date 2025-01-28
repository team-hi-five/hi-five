package com.h5.global.exception;

import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BoardException.class)
    public ResponseEntity<?> handleBoardException(BoardException e) {
        return ResponseEntity.status(e.getStatus())
                .body(new ErrorResponse(e.getMessage(), e.getStatus().value()));
    }

    @Getter
    public static class ErrorResponse {
        private final String message;
        private final int status;

        public ErrorResponse(String message, int status) {
            this.message = message;
            this.status = status;
        }

    }
}
