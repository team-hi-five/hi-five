package com.h5.notice.repository;

import com.h5.notice.entity.NoticeEntity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface NoticeRepository extends JpaRepository<NoticeEntity, Integer> {
    //전체 글 + 페이징
    @Query("SELECT n FROM NoticeEntity n " +
            "JOIN ConsultantUserEntity cu ON n.consultantUser.id = cu.id " +
            "WHERE n.deleteDttm IS NULL " +
            "AND (" +
            "   (:consultantUserId IS NOT NULL AND cu.center.id = (" +
            "       SELECT c.center.id " +
            "       FROM ConsultantUserEntity c " +
            "       WHERE c.id = :consultantUserId" +
            "   )) " +
            "   OR (:parentUserId IS NOT NULL AND cu.center.id = (" +
            "       SELECT pc.center.id " +
            "       FROM ParentUserEntity p " +
            "       JOIN p.consultantUserEntity pc " +
            "       WHERE p.id = :parentUserId" +
            "   ))" +
            ")")
    Page<NoticeEntity> findAll(
            @Param("consultantUserId") Integer consultantUserId,
            @Param("parentUserId") Integer parentUserId,
            Pageable pageable
    );


    //제목으로 검색 + 페이징
    @Query("SELECT n FROM NoticeEntity n WHERE n.title LIKE %:title% and n.deleteDttm is null")
    Page<NoticeEntity> findByTitle(@NotNull String title, Pageable pageable);

    //작성자로 검색 + 페이징
    @Query("SELECT n FROM NoticeEntity n WHERE n.consultantUser.email LIKE %:consultantUserEmail% and n.deleteDttm is null")
    Page<NoticeEntity> findByEmail(@Size(max = 30) @NotNull String consultantUserEmail, Pageable pageable);

    //상세 글 보기
    @Query("SELECT n FROM NoticeEntity n WHERE n.id = :noticeId and n.deleteDttm is null" )
    NoticeEntity findById(int noticeId);

    //조회수 증가
    @Modifying
    @Query("UPDATE NoticeEntity n SET n.viewCnt = n.viewCnt + 1 WHERE n.id = :noticeId")
    void updateViewCnt (@Param("noticeId") int id);


}
