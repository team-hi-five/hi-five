package com.h5.chatbot.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InsertChatbotReqeustDto {
    private int childUserId;
    private String sender;
    private int messageIndex;
    private String message;
}
