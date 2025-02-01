package com.h5.deleterequest.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GetMyDeleteChildResponseDto {

    public int childUserId;
    public String childName;
    public String gender;
    public int childAge;
}
