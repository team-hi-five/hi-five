package com.h5.chatbot.service;

import com.h5.chatbot.document.ChatBotDocument;
import com.h5.chatbot.dto.response.GetChatbotResponseDto;
import com.h5.chatbot.dto.response.GetChatbotDatesResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface ChatbotService {
    ChatBotDocument startChat(int childUserId);

    List<ChatBotDocument> continueChat(String chatbotId, int childUserId, String voidData);

    GetChatbotDatesResponseDto getChatbotDates(int childUserId, int year, int month);

    GetChatbotResponseDto getChatbot(int childUserId, LocalDate date);
}
