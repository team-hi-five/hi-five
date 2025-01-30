package com.h5.deleterequest.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GetMyDeleteChildResponseDto {

    public int child_user_id;
    public String child_name;
    public String gender;
    public int child_age;
}
