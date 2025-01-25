package com.h5.file.controller;

import com.h5.file.dto.request.FileUploadRequestDto;
import com.h5.file.entity.FileEntity;
import com.h5.file.service.FileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/file")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // 파일 업로드
    @PostMapping("/upload")
    public ResponseEntity<List<FileEntity>> uploadFiles(@Valid @RequestBody List<FileUploadRequestDto> fileUploadRequestDtos) {
        List<FileEntity> uploadedFiles = fileService.upload(fileUploadRequestDtos);
        return ResponseEntity.ok(uploadedFiles);
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
