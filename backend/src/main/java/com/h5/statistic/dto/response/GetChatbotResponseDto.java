package com.h5.statistic.dto.response;

import com.h5.statistic.entity.ChatBotDocument;
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
