package com.h5.asset.entity;

import com.h5.game.entity.ChildGameStageEntity;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emotion_id")
    private GameChapterEntity emotion;

    @NotNull
    @Column(name = "stage", nullable = false)
    private Integer stage;

    @NotNull
    @Column(name = "crt_ans", nullable = false)
    private Integer crtAns;

    @OneToOne(mappedBy = "gameStageEntity")
    private CardAssetEntity cardAssetEntity;

    @OneToMany(mappedBy = "gameStage")
    private Set<ChildGameStageEntity> childGameStageEntities = new LinkedHashSet<>();

    @OneToMany(mappedBy = "gameStage")
    private Set<ChildStudyStageEntity> childStudyStageEntities = new LinkedHashSet<>();

    @OneToOne(mappedBy = "gameStageEntity")
    private GameAssetEntity gameAssetEntity;

}