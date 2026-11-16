package com.personal.finance.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of("field", fe.getField(), "issue", String.valueOf(fe.getDefaultMessage())))
                .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", Map.of(
                        "code", "VALIDATION_ERROR",
                        "message", "Du lieu gui len khong hop le",
                        "details", details
                )
        ));
    }

    // Framework exceptions carry SQL / parser internals in getMessage(); return a fixed message instead.
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(org.springframework.dao.DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", Map.of(
                        "code", "CONFLICT",
                        "message", "Dữ liệu đang được sử dụng hoặc bị trùng, không thể thực hiện thao tác này."
                )
        ));
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", Map.of(
                        "code", "VALIDATION_ERROR",
                        "message", "Dữ liệu gửi lên không đúng định dạng."
                )
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", Map.of(
                        "code", "BAD_REQUEST",
                        "message", ex.getMessage()
                )
        ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", Map.of(
                        "code", "FORBIDDEN",
                        "message", ex.getMessage()
                )
        ));
    }
}