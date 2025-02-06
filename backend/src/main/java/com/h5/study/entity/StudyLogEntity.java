package com.h5.study.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "study_log")
public class StudyLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "study_log_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_study_stage_id")
    private ChildStudyStageEntity childStudyStageEntity;

    @NotNull
    @Lob
    @Column(name = "f_happy", nullable = false)
    private String fHappy;

    @NotNull
    @Lob
    @Column(name = "f_anger", nullable = false)
    private String fAnger;

    @NotNull
    @Lob
    @Column(name = "f_sad", nullable = false)
    private String fSad;

    @NotNull
    @Lob
    @Column(name = "f_panic", nullable = false)
    private String fPanic;

    @NotNull
    @Lob
    @Column(name = "f_fear", nullable = false)
    private String fFear;

    @NotNull
    @Lob
    @Column(name = "t_happy", nullable = false)
    private String tHappy;

    @NotNull
    @Lob
    @Column(name = "t_anger", nullable = false)
    private String tAnger;

    @NotNull
    @Lob
    @Column(name = "t_sad", nullable = false)
    private String tSad;

    @NotNull
    @Lob
    @Column(name = "t_panic", nullable = false)
    private String tPanic;

    @NotNull
    @Lob
    @Column(name = "t_fear", nullable = false)
    private String tFear;

    @NotNull
    @Lob
    @Column(name = "stt", nullable = false)
    private String stt;

    @NotNull
    @Column(name = "start_dttm")
    private String startDttm;

    @Column(name = "end_dttm")
    private String endDttm;

}