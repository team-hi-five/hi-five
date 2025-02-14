package com.h5.chatbot.controller;

import com.h5.chatbot.dto.request.InsertChatbotReqeustDto;
import com.h5.chatbot.service.ChatbotService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/chatbot")
public class ChatbotController {
    private final ChatbotService chatbotService;

    @Autowired
    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/insert-chatbot")
    public ResponseEntity<?> insertChatbot(@Valid @RequestBody InsertChatbotReqeustDto insertChatbotReqeustDto) {
        return ResponseEntity.ok(chatbotService.insertChatbot(insertChatbotReqeustDto));
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
