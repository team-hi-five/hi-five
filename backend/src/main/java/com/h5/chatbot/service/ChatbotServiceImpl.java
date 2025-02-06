package com.h5.chatbot.service;

import com.h5.chatbot.document.ChatBotDocument;
import com.h5.chatbot.repository.ChatbotRepository;
import com.h5.chatbot.dto.response.GetChatbotResponseDto;
import com.h5.chatbot.dto.response.GetChatbotDatesResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotServiceImpl implements ChatbotService {

    private final ChatbotRepository chatbotRepository;

    @Autowired
    public ChatbotServiceImpl(ChatbotRepository chatbotRepository) {
        this.chatbotRepository = chatbotRepository;
    }

    @Override
    public ChatBotDocument startChat(int childUserId) {
        String chatbotId = UUID.randomUUID().toString();

        ChatBotDocument gptFirst = ChatBotDocument.builder()
                .chatbotId(chatbotId)
                .childUserId(childUserId)
                .chatBotUseDttm(LocalDateTime.now())
                .sender("GPT")
                .messageIndex(1)
                .message(gptFirstChat())
                .build();

        chatbotRepository.save(gptFirst);

        return gptFirst;
    }

    @Override
    public List<ChatBotDocument> continueChat(String chatbotId, int childUserId, String voidData) {
        List<ChatBotDocument> chatBotDocumentList = chatbotRepository.findByChatbotIdOrderByMessageIndexAsc(chatbotId)
                .orElseThrow(() -> new IllegalStateException("Chatbot " + chatbotId + " not found"));

        int lastIndex = chatBotDocumentList.get(chatBotDocumentList.size() - 1).getMessageIndex();

        int maxChatbotSize = 5;
        if (lastIndex >= maxChatbotSize) {
            throw new IllegalStateException("Chatbot " + chatbotId + " is full");
        }

        int userIndex = lastIndex + 1;
        String userText = speechToText(voidData);
        ChatBotDocument userMessage = ChatBotDocument.builder()
                .chatbotId(chatbotId)
                .childUserId(childUserId)
                .chatBotUseDttm(LocalDateTime.now())
                .sender("USER")
                .messageIndex(userIndex)
                .message(userText)
                .build();

        chatbotRepository.save(userMessage);

        String sentiment = analyzeSentiment(userText);

        int gptIndex = userIndex + 1;
        boolean isFinal = (gptIndex == maxChatbotSize);
        String gptReply = isFinal ? finalGPTReply(sentiment) : generateGPTReply(sentiment);

        ChatBotDocument gptMessage = ChatBotDocument.builder()
                .chatbotId(chatbotId)
                .childUserId(childUserId)
                .chatBotUseDttm(LocalDateTime.now())
                .sender("GPT")
                .messageIndex(gptIndex)
                .message(gptReply)
                .build();

        chatbotRepository.save(gptMessage);

        return List.of(userMessage, gptMessage);
    }

    private String gptFirstChat() {
        return "";
    }

    private String speechToText(String voiceData) {
        return "";
    }

    private String analyzeSentiment(String text) {
        return "";
    }

    private String finalGPTReply(String sentiment) {
        return "";
    }

    private String generateGPTReply(String sentiment) {
        return "";
    }

    @Override
    public GetChatbotDatesResponseDto getChatbotDates(int childUserId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<ChatBotDocument> chatbotDocList = chatbotRepository.findByChildUserIdAndChatBotUseDttmBetween(childUserId, startDate, endDate)
                .orElseThrow(NoSuchElementException::new);

        return GetChatbotDatesResponseDto.builder()
                .dateList(chatbotDocList.stream()
                        .map(chatbot -> chatbot.getChatBotUseDttm().toLocalDate())
                        .distinct()
                        .sorted()
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public GetChatbotResponseDto getChatbot(int childUserId, LocalDate date) {
        LocalDateTime startDate = date.atStartOfDay();
        LocalDateTime endDate = date.atTime(23, 59, 59);

        List<ChatBotDocument> chatBotDocumentList = chatbotRepository.findByChildUserIdAndChatBotUseDttmBetween(childUserId,startDate,endDate)
                .orElseThrow(NoSuchElementException::new);

        return GetChatbotResponseDto.builder()
                .chatBotDocumentList(chatBotDocumentList)
                .build();
    }

}
