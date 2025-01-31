package com.h5.game.entity;

import com.h5.asset.entity.GameStageEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "child_game_stage")
public class ChildGameStageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "child_game_stage_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_stage_id", nullable = false)
    private GameStageEntity gameStage;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_chapter_id", nullable = false)
    private ChildGameChapterEntity userChapter;

    @OneToMany(mappedBy = "childGameStage")
    private Set<GameLogEntity> gameLogs = new LinkedHashSet<>();

}