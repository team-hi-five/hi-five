package com.h5.chatbot.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ChatbotDto {
    private int childUserId;
    private String sender;
    private int messageIndex;
    private String message;
}
