package com.h5.chatbot.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InsertChatbotReqeustDto {
    List<ChatbotDto> chatbotDtos;
}
