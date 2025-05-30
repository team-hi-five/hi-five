package com.h5.domain.deleterequest.dto.response;

import com.h5.domain.deleterequest.entity.DeleteUserRequestEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DeleteUserRequestRejectResponseDto {
    private int deleteRequestId;
    private DeleteUserRequestEntity.Status status;
    private String deleteConfirmDttm;
}
