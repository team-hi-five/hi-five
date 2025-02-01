package com.h5.file.controller;

import com.h5.file.dto.request.FileUploadRequestDto;
import com.h5.file.entity.FileEntity;
import com.h5.file.service.FileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.print.attribute.standard.Media;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/file")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // 파일 업로드
    @PostMapping(value = "/upload", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE})
    public ResponseEntity<List<FileEntity>> uploadFiles(@RequestPart("files") List<MultipartFile> multipartFileList,
                                                        @RequestPart("tblType") List<String> tblTypes,
                                                        @RequestPart("tblId") List<Integer> tblIds) {

        if(multipartFileList.size() != tblTypes.size() || multipartFileList.size() != tblIds.size()) {
            throw new IllegalArgumentException("File upload request don't match");
        }

        List<FileUploadRequestDto> fileUploadRequestDtos = new ArrayList<>();
        for (int i = 0; i < multipartFileList.size(); i++) {
            FileUploadRequestDto fileUploadRequestDto = FileUploadRequestDto.builder()
                    .multipartFile(multipartFileList.get(i))
                    .tblType(FileEntity.TblType.valueOf(tblTypes.get(i)))
                    .tblId(tblIds.get(i))
                    .build();

            fileUploadRequestDtos.add(fileUploadRequestDto);
        }

        return ResponseEntity.ok(fileService.upload(fileUploadRequestDtos));
    }

    // 파일 URL 조회
    @GetMapping("/urls/{tblType}/{tblId}")
    public ResponseEntity<?> getFileUrls(@PathVariable FileEntity.TblType tblType, @PathVariable Integer tblId) {
        return ResponseEntity.ok(fileService.getFileUrl(tblType, tblId));
    }

    // 파일 다운로드
    @GetMapping("/download/{fileId}")
    public ResponseEntity<?> downloadFile(@PathVariable Integer fileId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileService.getOriginFileName(fileId) + "\"")
                .body(fileService.downloadFile(fileId));
    }

    // 파일 삭제
    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> deleteFile(@PathVariable Integer fileId) {
        fileService.deleteFile(fileId);
        return ResponseEntity.ok("File successfully deleted.");
    }
}
