package com.h5.notice.entity;

import com.h5.consultant.entity.ConsultantUserEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;


@Entity
@Table(name = "notice")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id", nullable = false)
    private Integer id;

    @Size(max = 200)
    @NotNull
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "view_cnt", nullable = false)
    private Integer viewCnt;

    @NotNull
    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "create_dttm", nullable = false)
    private String createDttm;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "update_dttm", nullable = false)
    private String updateDttm;

    @Column(name = "delete_dttm")
    private String deleteDttm;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultant_user_id", nullable = false)
    private ConsultantUserEntity consultantUser;

}
