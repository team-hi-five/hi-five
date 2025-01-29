package com.h5.statistic.dto.data;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@Builder
public class ChatbotDateDto {
    private List<LocalDate> chatbotDateList;
}
