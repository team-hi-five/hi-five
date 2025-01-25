package com.h5.file.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Size(max = 255)
    @NotNull
    @Column(name = "origin_file_name", nullable = false)
    private String originFileName;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "upload_dttm", nullable = false)
    private String uploadDttm;

    @Column(name = "delete_dttm")
    private String deleteDttm;

    public enum TblType {
        P, N, Q, G, QA
    }

    @NotNull
    @Lob
    @Column(name = "tbl_type", nullable = false)
    private TblType tblType;

    @NotNull
    @Column(name = "tbl_id", nullable = false)
    private Integer tblId;

}
