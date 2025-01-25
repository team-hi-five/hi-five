package com.h5.file.service;

import com.h5.file.dto.request.FileUploadRequestDto;
import com.h5.file.dto.response.GetFileUrlResponseDto;
import com.h5.file.entity.FileEntity;
import com.h5.file.repository.FileRepository;
import com.h5.global.exception.FileDeleteException;
import com.h5.global.exception.FileNotFoundException;
import com.h5.global.exception.FileUploadIOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;

    @Value("${profile.image.upload.dir}")
    private String profileImgUploadDir;

    @Value("${file.access.url.prefix}")
    private String fileAccessUrlPrefix;

    public FileServiceImpl(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    @Override
    public List<FileEntity> upload(List<FileUploadRequestDto> fileUploadRequestDtos) {
        List<FileEntity> fileEntities = new ArrayList<>();
        for (FileUploadRequestDto requestDto : fileUploadRequestDtos) {
            FileEntity fileEntity = saveFile(requestDto.getMultipartFile(), requestDto.getTblType(), requestDto.getTblId());
            fileEntities.add(fileEntity);
        }
        return fileEntities;
    }

    @Override
    public List<GetFileUrlResponseDto> getFileUrl(FileEntity.TblType tblType, int tblId) {
        List<FileEntity> fileEntities = fileRepository.findAllByTblTypeAndTblId(tblType, tblId);

        List<GetFileUrlResponseDto> responseDtos = new ArrayList<>();
        for (FileEntity fileEntity : fileEntities) {
            responseDtos.add(GetFileUrlResponseDto.builder()
                    .fileId(fileEntity.getId())
                    .url(fileAccessUrlPrefix + "/" + fileEntity.getFilePath())
                    .fileName(fileEntity.getOriginFileName())
                    .build());
        }
        return responseDtos;
    }

    @Override
    public Resource downloadFile(Integer fileId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found: " + fileId));

        return loadFileAsResource(fileEntity.getFilePath());
    }

    @Override
    public String getOriginFileName(Integer fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found: " + fileId))
                .getOriginFileName();
    }

    @Override
    public void deleteFile(Integer fileId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found: " + fileId));

        try {
            Files.deleteIfExists(Paths.get(profileImgUploadDir).resolve(fileEntity.getFilePath()));
        } catch (IOException e) {
            throw new FileDeleteException("Failed to delete file: " + fileEntity.getFilePath());
        }

        fileRepository.delete(fileEntity);
    }

    private FileEntity saveFile(MultipartFile file, FileEntity.TblType tblType, int tblId) {
        String originalFileName = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID().toString().replaceAll("-", "") + "_" + originalFileName;

        Path targetPath = Paths.get(profileImgUploadDir, uniqueFileName);

        try {
            Files.createDirectories(targetPath.getParent());
            file.transferTo(targetPath);
        } catch (IOException e) {
            throw new FileUploadIOException("Failed to save file: " + originalFileName, e);
        }

        return fileRepository.save(FileEntity.builder()
                .filePath(uniqueFileName) // 저장 경로를 상대 경로로 설정
                .originFileName(originalFileName)
                .tblType(tblType)
                .tblId(tblId)
                .build());
    }

    private Resource loadFileAsResource(String filePath) {
        try {
            Path path = Paths.get(profileImgUploadDir).resolve(filePath).normalize();
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new FileNotFoundException("File not found or not readable: " + filePath);
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to load file as resource", e);
        }
    }
}
