package com.h5.qna.repository;

import com.h5.qna.entity.QnaAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QnaAnswerRepository extends JpaRepository<QnaAnswerEntity, Integer> {
    //BoardId로 댓글 가져오기
    Optional<QnaAnswerEntity> findByBoardId(Integer qnaId);
}
