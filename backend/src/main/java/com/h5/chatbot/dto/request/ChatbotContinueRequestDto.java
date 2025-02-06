package com.h5.chatbot.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ChatbotContinueRequestDto {
    private String chatbotId;
    private int childUserId;
    private String voiceData;
}
