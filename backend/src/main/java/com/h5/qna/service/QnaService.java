package com.h5.qna.service;

import com.h5.qna.dto.request.*;
import com.h5.qna.dto.response.QnaCommentResponseDto;
import com.h5.qna.dto.response.QnaDetailResponseDto;
import com.h5.qna.dto.response.QnaListResponseDto;

public interface QnaService {
    //c
    int createQna(QnaCreateRequestDto qnaCreateRequestDto);

    //r
    //전체 글
    QnaListResponseDto findAll(QnaSearchRequestDto qnaSearchRequestDto);

    //제목으로
    QnaListResponseDto findByTitle(QnaSearchRequestDto qnaSearchRequestDto);

    //작성자로
    QnaListResponseDto findByName(QnaSearchRequestDto qnaSearchRequestDto);

    //상세
    QnaDetailResponseDto findById(int qnaId);

    //u
    void updateViewCnt(int qnaId);

    int updateQna(QnaUpdateRequestDto qnaUpdateRequestDto);

    //d
    void deleteQna(int qnaId);


    //comment
    //c
    QnaCommentResponseDto createQnaComment(QnaCommentCreateRequestDto qnaCommentSaveRequestDto);

    //u
    QnaCommentResponseDto updateComment(QnaCommentUpdateRequestDto qnaCommentSaveRequestDto);

    //d
    QnaCommentResponseDto deleteComment(int qnaCommentId);

}
