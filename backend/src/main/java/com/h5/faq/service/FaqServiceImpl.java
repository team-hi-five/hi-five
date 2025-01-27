package com.h5.faq.service;

import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.faq.dto.request.FaqCreateRequestDto;
import com.h5.faq.dto.request.FaqSearchRequestDto;
import com.h5.faq.dto.request.FaqUpdateRequestDto;
import com.h5.faq.dto.response.FaqDetailResponseDto;
import com.h5.faq.dto.response.FaqResponseDto;
import com.h5.faq.entity.FaqEntity;
import com.h5.faq.repository.FaqRepository;
import com.h5.global.util.JwtUtil;
import com.h5.parent.repository.ParentUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class FaqServiceImpl implements FaqService {
    private final FaqRepository faqRepository;
    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;
    private final JwtUtil jwtUtil;

    //c
    //글 등록
    @Override
    public void createFaq(FaqCreateRequestDto faqCreateRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("Can not find ConsultantUser"));

        if(!role.equals("ROLE_CONSULTANT")) {
            throw new RuntimeException("Only ROLE_CONSULTANT can be create faq");
        }

        FaqEntity faqEntity = FaqEntity.builder()
                .title(faqCreateRequestDto.getTitle())
                .content(faqCreateRequestDto.getContent())
                .faqAns(faqCreateRequestDto.getFaqAnswer())
                .consultantUser(consultantUser)
                .build();

        faqRepository.save(faqEntity);
    }

    //r
    //전체 목록
    @Override
    public Page<FaqResponseDto> findAll(FaqSearchRequestDto faqSearchRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);
        Pageable pageable = faqSearchRequestDto.getPageable();

        Integer parentUserId = null;
        Integer consultantUserId = null;

        if ("ROLE_PARENT".equals(role)) {
            parentUserId = parentUserRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid parent user"))
                    .getId();
        }

        if ("ROLE_CONSULTANT".equals(role)) {
            consultantUserId = consultantUserRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid consultant user"))
                    .getId();
        }

        Page<FaqEntity> faqEntityPage= faqRepository.findAll(role, parentUserId, consultantUserId, pageable);

        return faqEntityPage.map(faqEntity -> new FaqResponseDto(
                faqEntity.getId(),
                faqEntity.getTitle(),
                faqEntity.getContent(),
                faqEntity.getConsultantUser().getEmail()
        ));
    }

    //제목으로 검색
    @Override
    public Page<FaqResponseDto> findByTitle(FaqSearchRequestDto faqSearchRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        String searchTitle = faqSearchRequestDto.getKeyword();
        Pageable pageable = faqSearchRequestDto.getPageable();

        Integer parentUserId = null;
        Integer consultantUserId = null;

        if ("ROLE_PARENT".equals(role)) {
            parentUserId = parentUserRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid parent user"))
                    .getId();
        }

        if ("ROLE_CONSULTANT".equals(role)) {
            consultantUserId = consultantUserRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid consultant user"))
                    .getId();
        }

        Page<FaqEntity> faqEntityPage= faqRepository.findByTitle(role, parentUserId, consultantUserId, searchTitle, pageable);

        return faqEntityPage.map(faqEntity -> new FaqResponseDto(
                faqEntity.getId(),
                faqEntity.getTitle(),
                faqEntity.getContent(),
                faqEntity.getConsultantUser().getEmail()
        ));
    }

    //이메일로 검색
    @Override
    public Page<FaqResponseDto> findByEmail(FaqSearchRequestDto faqSearchRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        String searchEmail = faqSearchRequestDto.getKeyword();
        Pageable pageable = faqSearchRequestDto.getPageable();

        Integer parentUserId = null;
        Integer consultantUserId = null;

        if ("ROLE_PARENT".equals(role)) {
            parentUserId = parentUserRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid parent user"))
                    .getId();
        }

        if ("ROLE_CONSULTANT".equals(role)) {
            consultantUserId = consultantUserRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid consultant user"))
                    .getId();
        }

        Page<FaqEntity> faqEntityPage= faqRepository.findByEmail(role, parentUserId, consultantUserId, searchEmail, pageable);

        return faqEntityPage.map(faqEntity -> new FaqResponseDto(
                faqEntity.getId(),
                faqEntity.getTitle(),
                faqEntity.getContent(),
                faqEntity.getConsultantUser().getEmail()
        ));
    }

    //상세 조회
    @Override
    public FaqDetailResponseDto findById(int id) {
        FaqEntity faqEntity = faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Can not find FaqEntity"));

        return FaqDetailResponseDto.builder()
                .id(faqEntity.getId())
                .title(faqEntity.getTitle())
                .content(faqEntity.getContent())
                .faqAnswer(faqEntity.getFaqAns())
                .consultantUserEmail(faqEntity.getConsultantUser().getEmail())
                .build();
    }

    //u
    //글수정
    @Override
    public void updateFaq(FaqUpdateRequestDto faqUpdateRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Can not find ConsultantUser"));
        FaqEntity faqEntity = faqRepository.findById(faqUpdateRequestDto.getFaqId())
                .orElseThrow(() -> new RuntimeException("Can not find FaqEntity"));

        if(!Objects.equals(consultantUser.getId(), faqEntity.getConsultantUser().getId())) {
            throw new RuntimeException("Only Writer Can Update Faq");
        }

        faqEntity.setTitle(faqUpdateRequestDto.getFaqTitle());
        faqEntity.setContent(faqUpdateRequestDto.getFaqContent());
        faqEntity.setFaqAns(faqUpdateRequestDto.getFaqAnswer());

        faqRepository.save(faqEntity);
    }

    //d
    //글삭제
    @Override
    public void deleteFaq(int id, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Can not find ConsultantUser"));
        FaqEntity faqEntity = faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Can not find FaqEntity"));

        if(!Objects.equals(consultantUser.getId(), faqEntity.getConsultantUser().getId())) {
            throw new RuntimeException("Only Writer Can Delete Faq");
        }

        faqRepository.deleteById(id);
    }
}
