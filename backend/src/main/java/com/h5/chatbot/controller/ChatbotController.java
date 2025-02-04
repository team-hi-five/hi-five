package com.h5.chatbot.controller;

import com.h5.chatbot.document.ChatBotDocument;
import com.h5.chatbot.dto.request.ChatbotContinueRequestDto;
import com.h5.chatbot.dto.response.ChatbotContinueResponseDto;
import com.h5.chatbot.dto.response.ChatbotStartResponseDto;
import com.h5.chatbot.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chatbot")
public class ChatbotController {
    private final ChatbotService chatbotService;

    @Autowired
    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @GetMapping("/start")
    public ResponseEntity<?> start(@Valid @RequestParam int childUserId) {
        ChatBotDocument firstMessage = chatbotService.startChat(childUserId);

        return ResponseEntity.ok(ChatbotStartResponseDto.builder()
                .chatbotId(firstMessage.getChatbotId())
                .messageIndex(firstMessage.getMessageIndex())
                .sender(firstMessage.getSender())
                .message(firstMessage.getMessage())
                .build()
        );
    }

    @PostMapping("/continue")
    public ResponseEntity<?> continueChat(@Valid @RequestBody ChatbotContinueRequestDto chatbotContinueRequestDto) {
        List<ChatBotDocument> chatBotDocumentList = chatbotService.continueChat(
                chatbotContinueRequestDto.getChatbotId(),
                chatbotContinueRequestDto.getChildUserId(),
                chatbotContinueRequestDto.getVoiceData()
        );

        return ResponseEntity.ok(
                chatBotDocumentList.stream()
                        .sorted(Comparator.comparing(ChatBotDocument::getMessageIndex))
                        .map(doc -> ChatbotContinueResponseDto.builder()
                                .messageIndex(doc.getMessageIndex())
                                .message(doc.getMessage())
                                .sender(doc.getSender())
                                .build())
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/get-dates/chatbot")
    public ResponseEntity<?> getChatbotDates(@Valid @RequestParam int childUserId,
                                             @Valid @RequestParam int year,
                                             @Valid @RequestParam int month) {
        return ResponseEntity.ok(chatbotService.getChatbotDates(childUserId, year, month));
    }

    @GetMapping("/get-chatbot")
    public ResponseEntity<?> getChatbot(@Valid @RequestParam int childUserId,
                                        @Valid @RequestParam LocalDate date) {
        return ResponseEntity.ok(chatbotService.getChatbot(childUserId, date));
    }
}
