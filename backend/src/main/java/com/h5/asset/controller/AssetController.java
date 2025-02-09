package com.h5.asset.controller;

import com.h5.asset.dto.request.LoadAssetByStageDto;
import com.h5.asset.dto.request.LoadAssetRequestDto;
import com.h5.asset.dto.request.LoadCardRequestDto;
import com.h5.asset.dto.request.LoadStudyAssetRequestDto;
import com.h5.asset.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/asset")
@RequiredArgsConstructor
public class AssetController {
    private final AssetService assetService;

    @PostMapping("/load-asset")
    public ResponseEntity<?> getAsset(@RequestBody LoadAssetRequestDto loadAssetRequestDto) {
        return ResponseEntity.ok(assetService.loadAsset(loadAssetRequestDto));
    }

    @PostMapping("/load-cards")
    public ResponseEntity<?> getCards(@RequestBody LoadCardRequestDto loadCardRequestDto) {
        return ResponseEntity.ok(assetService.loadCards(loadCardRequestDto));
    }

    @PostMapping("/load-stage-asset")
    public ResponseEntity<?> getAssetByStage(@RequestBody LoadAssetByStageDto loadAssetByStageDto) {
        return ResponseEntity.ok(assetService.loadAssetByStage(loadAssetByStageDto));
    }

    @PostMapping("/load-chapter-asset")
    public ResponseEntity<?> getChapterAsset(@RequestBody LoadAssetRequestDto loadAssetRequestDto) {
        return ResponseEntity.ok(assetService.loadChapterAsset(loadAssetRequestDto));
    }

    @PostMapping("/load-study-asset")
    public ResponseEntity<?> getStudyAsset(@RequestBody LoadStudyAssetRequestDto loadStudyAssetRequestDto){
        return ResponseEntity.ok(assetService.loadStudyAsset(loadStudyAssetRequestDto));
    }

}
