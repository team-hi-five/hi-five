package com.h5.global.exception;

import com.github.hyeonjaez.springcommon.handler.AbstractGlobalExceptionHandler;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Hidden
@RestControllerAdvice
public class ExceptionHandler extends AbstractGlobalExceptionHandler {
}