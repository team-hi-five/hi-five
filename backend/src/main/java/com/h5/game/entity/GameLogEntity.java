package com.h5.game.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "game_log")
public class GameLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_log_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_game_session_id")
    private ChildGameStageEntity childGameSession;

    @NotNull
    @Column(name = "selected_opt", nullable = false)
    private Integer selectedOpt;

    @NotNull
    @Column(name = "corrected", nullable = false)
    private Boolean corrected = false;

    @NotNull
    @Column(name = "submit_dttm", nullable = false)
    private Instant submitDttm;

    @NotNull
    @Column(name = "consulted", nullable = false)
    private Boolean consulted = false;

    @OneToOne(mappedBy = "gameLogEntity")
    private AiLogEntity aiLogEntity;

}