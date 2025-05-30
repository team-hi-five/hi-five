package com.h5.domain.chatbot.dto.response;

import com.h5.domain.chatbot.document.ChatBotDocument;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Builder
public class GetChatbotResponseDto {
    private List<ChatBotDocument> chatBotDocumentList;
}
