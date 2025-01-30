package com.h5.faq.dto.response;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FaqDetailResponseDto {
    private int id;
    private String title;
    private String content;
    private String faqAnswer;
    private String consultantUserEmail;
}
