package com.h5.file.service;

import com.h5.file.dto.request.FileUploadRequestDto;
import com.h5.file.dto.response.GetFileUrlResponseDto;
import com.h5.file.entity.FileEntity;
import org.springframework.core.io.Resource;

import java.util.List;

public interface FileService {
    List<FileEntity> upload(List<FileUploadRequestDto> fileUploadRequestDtos);

    List<GetFileUrlResponseDto> getFileUrl(FileEntity.TblType tblType, int tblId);

    Resource downloadFile(Integer fileId);

    String getOriginFileName(Integer fileId);

    void deleteFile(Integer fileId);
}
