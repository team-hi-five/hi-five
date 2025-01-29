package com.h5.game.entity;

import com.h5.asset.entity.GameChapterEntity;
import com.h5.child.entity.ChildUserEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "child_game_chapter")
public class ChildGameChapterEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "child_game_chapter_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emotion_id")
    private GameChapterEntity emotion;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_user_id", nullable = false)
    private ChildUserEntity childUser;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "start_dttm", nullable = false)
    private Instant startDttm;

    @Column(name = "end_dttm")
    private Instant endDttm;

    @OneToMany(mappedBy = "userChapter")
    private Set<ChildGameStageEntity> childGameStages = new LinkedHashSet<>();

}