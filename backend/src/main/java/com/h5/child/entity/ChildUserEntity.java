package com.h5.child.entity;

import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.parent.entity.ParentUserEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "child_user")
public class ChildUserEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "child_user_id", nullable = false)
    private Integer id;

    @NotNull
    @Lob
    @Column(name = "interest", nullable = false)
    private String interest;

    @NotNull
    @Column(name = "first_consult_dt", nullable = false)
    private String firstConsultDt;

    @NotNull
    @Column(name = "birth", nullable = false)
    private String birth;

    @Lob
    @Column(name = "gender")
    private String gender;

    @Lob
    @Column(name = "additional_info")
    private String additionalInfo;

    @Column(name = "clear_chapter")
    private Integer clearChapter;

    @Size(max = 10)
    @NotNull
    @Column(name = "name", nullable = false, length = 10)
    private String name;

    @Size(max = 255)
    @Column(name = "refresh_token")
    private String refreshToken;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_user_id", nullable = false)
    private ParentUserEntity parentUserEntity;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultant_user_id", nullable = false)
    private ConsultantUserEntity consultantUserEntity;

}