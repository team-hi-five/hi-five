package com.h5.asset.entity;

import com.h5.emotion.entity.EmotionEntity;
import com.h5.game.entity.ChildGameChapterEntity;
import com.h5.study.entity.ChildStudyChapterEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor
@Entity
@Table(name = "game_chapter")
public class GameChapterEntity {

    @Id
    @Column(name = "emotion_id", nullable = false)
    private Integer id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emotion_id", nullable = false)
    private EmotionEntity emotion;

    @Size(max = 100)
    @NotNull
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Size(max = 100)
    @NotNull
    @Column(name = "chapter_pic", nullable = false, length = 100)
    private String chapterPic;

    @OneToMany(mappedBy = "emotion")
    private Set<ChildGameChapterEntity> childGameChapterEntities = new LinkedHashSet<>();

    @OneToMany(mappedBy = "emotion")
    private Set<ChildStudyChapterEntity> childStudyChapterEntities = new LinkedHashSet<>();

    @OneToMany(mappedBy = "emotion")
    private Set<GameStageEntity> gameStageEntities = new LinkedHashSet<>();

}
