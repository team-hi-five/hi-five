package com.h5.deleterequest.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
public class GetMyDeleteResponseDto {
    public int deleteUserRequestId;
    public int parentUserId;
    public String parentName;
    public Set<GetMyDeleteChildResponseDto> children;
}
