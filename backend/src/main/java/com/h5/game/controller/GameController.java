package com.h5.game.controller;

import com.h5.game.dto.request.SaveGameLogRequestDto;
import com.h5.game.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping()
    public ResponseEntity<?> saveGameLog(SaveGameLogRequestDto saveGameLogRequestDto) {
        gameService.saveGameLog(saveGameLogRequestDto);

        return ResponseEntity.ok().build();
    }
}
