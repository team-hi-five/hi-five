package com.h5.asset.entity;

import com.h5.emotion.entity.EmotionEntity;
import com.h5.game.entity.ChildGameStageEntity;
import com.h5.game.entity.GameLogEntity;
import com.h5.study.entity.ChildStudyStageEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "game_stage")
public class GameStageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_stage_id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "stage", nullable = false)
    private Integer stage;

    @NotNull
    @Column(name = "crt_ans", nullable = false)
    private Integer crtAns;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_chapter_id", nullable = false)
    private GameChapterEntity gameChapter;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emotion_id", nullable = false)
    private EmotionEntity emotion;

    @OneToOne(mappedBy = "gameStageEntity")
    private CardAssetEntity cardAsset;

    @OneToMany(mappedBy = "gameStage")
    private Set<ChildGameStageEntity> childGameStages = new LinkedHashSet<>();

    @OneToMany(mappedBy = "gameStage")
    private Set<ChildStudyStageEntity> childStudyStages = new LinkedHashSet<>();

    @OneToOne(mappedBy = "gameStageEntity")
    private GameAssetEntity gameAsset;

    @OneToMany(mappedBy = "gameStage")
    private Set<GameLogEntity> gameLogs = new LinkedHashSet<>();

}