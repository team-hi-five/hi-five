package com.h5.domain.session.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateSessionRequestDto {
    private int schdlId;
    private String type; //consult, game
}
