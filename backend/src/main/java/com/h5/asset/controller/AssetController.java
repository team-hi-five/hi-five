package com.h5.asset.controller;

import com.h5.asset.dto.request.LoadAssetRequestDto;
import com.h5.asset.dto.request.LoadCardRequestDto;
import com.h5.asset.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/asset")
@RequiredArgsConstructor
public class AssetController {
    private final AssetService assetService;

    @GetMapping("/load-asset")
    public ResponseEntity<?> getAsset(@ModelAttribute LoadAssetRequestDto loadAssetRequestDto) {
        return ResponseEntity.ok(assetService.loadAsset(loadAssetRequestDto));
    }

    @GetMapping("/load-cards")
    public ResponseEntity<?> getCards(@ModelAttribute LoadCardRequestDto loadCardRequestDto) {
        return ResponseEntity.ok(assetService.loadCard(loadCardRequestDto));
    }


}
