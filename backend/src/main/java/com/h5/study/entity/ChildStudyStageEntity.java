package com.h5.study.entity;

import com.h5.asset.entity.GameStageEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "child_study_stage")
public class ChildStudyStageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "child_study_stage_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_stage_id")
    private GameStageEntity gameStageEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_game_chapter_id")
    private ChildStudyChapterEntity childStudyChapterEntity;

    @OneToMany(mappedBy = "childStudyStageEntity")
    private Set<StudyLogEntity> studyLogEntities = new LinkedHashSet<>();

}