package com.h5.faq.service;

import com.h5.faq.dto.request.FaqCreateRequestDto;
import com.h5.faq.dto.request.FaqSearchRequestDto;
import com.h5.faq.dto.request.FaqUpdateRequestDto;
import com.h5.faq.dto.response.FaqDetailResponseDto;
import com.h5.faq.dto.response.FaqResponseDto;
import org.springframework.data.domain.Page;

public interface FaqService {
    //c
    void createFaq(FaqCreateRequestDto faqCreateRequestDto);
    //r
    //전체
    Page<FaqResponseDto> findAll(FaqSearchRequestDto faqSearchRequestDto);

    //제목
    Page<FaqResponseDto> findByTitle(FaqSearchRequestDto faqSearchRequestDto);

    //작성자
    Page<FaqResponseDto> findByEmail(FaqSearchRequestDto faqSearchRequestDto);

    FaqDetailResponseDto findById(int id);
    //u
    void updateFaq(FaqUpdateRequestDto faqUpdateRequestDto);

    //d
    void deleteFaq(int id);
}
