package com.personal.finance.backend.common.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}