package com.h5.deleterequest.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
public class GetMyDeleteResponseDto {
    public int delete_user_request_id;
    public int parent_user_id;
    public String parent_name;
    public Set<GetMyDeleteChildResponseDto> children;
}
