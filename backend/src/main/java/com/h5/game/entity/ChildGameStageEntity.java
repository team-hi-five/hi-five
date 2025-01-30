package com.h5.game.entity;

import com.h5.asset.entity.GameStageEntity;
import jakarta.persistence.*;
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
    @Column(name = "child_game_session_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_stage_id")
    private GameStageEntity gameStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_chapter_id")
    private ChildGameChapterEntity userChapter;

    @OneToMany(mappedBy = "childGameSession")
    private Set<GameLogEntity> gameLogEntities = new LinkedHashSet<>();

}