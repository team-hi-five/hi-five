package com.h5.faq.service;

import com.h5.faq.dto.request.FaqCreateRequestDto;
import com.h5.faq.dto.request.FaqSearchRequestDto;
import com.h5.faq.dto.request.FaqUpdateRequestDto;
import com.h5.faq.dto.response.FaqDetailResponseDto;
import com.h5.faq.dto.response.FaqListResponseDto;


public interface FaqService {
    //c
    void createFaq(FaqCreateRequestDto faqCreateRequestDto);
    //r
    //전체
    FaqListResponseDto findAll(FaqSearchRequestDto faqSearchRequestDto);

    //제목
    FaqListResponseDto findByTitle(FaqSearchRequestDto faqSearchRequestDto);

    //작성자
    FaqListResponseDto findByEmail(FaqSearchRequestDto faqSearchRequestDto);

    FaqDetailResponseDto findById(int id);
    //u
    void updateFaq(FaqUpdateRequestDto faqUpdateRequestDto);

    //d
    void deleteFaq(int id);
}
