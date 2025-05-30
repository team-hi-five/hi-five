package com.h5.domain.chatbot.service;

import com.h5.domain.chatbot.dto.request.InsertChatbotRequestDto;
import com.h5.domain.chatbot.dto.response.GetChatbotResponseDto;
import com.h5.domain.chatbot.dto.response.GetChatbotDatesResponseDto;

import java.time.LocalDate;

public interface ChatbotService {
    String insertChatbot(InsertChatbotRequestDto insertChatbotRequestDto);

    GetChatbotDatesResponseDto getChatbotDates(int childUserId, int year, int month);

    GetChatbotResponseDto getChatbot(int childUserId, LocalDate date);
}
