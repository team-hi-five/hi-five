package com.h5.file.dto.request;

import com.h5.file.entity.FileEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
public class FileUploadRequestDto {
    private MultipartFile multipartFile;
    private FileEntity.TblType tblType;
    private Integer tblId;
}
