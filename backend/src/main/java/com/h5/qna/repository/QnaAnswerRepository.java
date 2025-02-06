package com.h5.qna.repository;

import com.h5.qna.entity.QnaAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QnaAnswerRepository extends JpaRepository<QnaAnswerEntity, Integer> {
    //BoardId로 댓글 가져오기
    List<QnaAnswerEntity> findByQnaEntity_IdAndDeleteDttmIsNull(Integer qnaId);

    // 특정 질문(QnaEntity)과 연결된 답변 개수를 반환
    @Query("SELECT COUNT(a) FROM QnaAnswerEntity a WHERE a.qnaEntity.id = :qnaId AND a.deleteDttm IS NULL")
    int countByQnaEntity_Id(@Param("qnaId") Integer qnaId);
}
