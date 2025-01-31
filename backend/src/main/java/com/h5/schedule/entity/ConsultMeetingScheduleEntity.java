package com.h5.schedule.entity;

import com.h5.child.entity.ChildUserEntity;
import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.parent.entity.ParentUserEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "consult_meeting_schdl")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultMeetingScheduleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meeting_schdl_id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "schdl_dttm", nullable = false)
    private LocalDateTime schdlDttm;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "create_dttm", nullable = false)
    private LocalDateTime createDttm;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "update_dttm")
    private LocalDateTime updateDttm;

    @Column(name = "delete_dttm")
    private LocalDateTime deleteDttm;

    @NotNull
    @Column(name = "start_dttm", nullable = false)
    private LocalDateTime startDttm;

    @NotNull
    @ColumnDefault("'P'")
    @Lob
    @Column(name = "status", nullable = false)
    private String status;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "host_id", nullable = false)
    private ConsultantUserEntity host;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_user_id", nullable = false)
    private ParentUserEntity parentUserEntity;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_user_id", nullable = false)
    private ChildUserEntity childUserEntity;

}
