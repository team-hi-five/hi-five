package com.h5.notice.service;

import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.util.JwtUtil;
import com.h5.notice.dto.request.*;
import com.h5.notice.dto.response.NoticeDetailResponseDto;
import com.h5.notice.dto.response.NoticeResponseDto;
import com.h5.notice.entity.NoticeEntity;
import com.h5.notice.repository.NoticeRepository;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional

public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;
    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;
    private final JwtUtil jwtUtil;

    //전체 글 리스트
    @Override
    public Page<NoticeResponseDto> findAll(NoticeListRequestDto noticeListRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        Page<NoticeEntity> noticeEntityPage;

        switch (role) {
            case "ROLE_CONSULTANT":
                ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Consultant user not found with email: " + email));
                noticeEntityPage = noticeRepository.findAll(consultantUser.getId(), null, noticeListRequestDto.getPageable());
                break;

            case "ROLE_PARENT":
                ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Parent user not found with email: " + email));
                noticeEntityPage = noticeRepository.findAll(null, parentUser.getId(), noticeListRequestDto.getPageable());
                break;

            default:
                throw new RuntimeException("Invalid role: " + role);
        }

        return noticeEntityPage.map(noticeEntity -> new NoticeResponseDto(
                noticeEntity.getId(),
                noticeEntity.getTitle(),
                noticeEntity.getConsultantUser().getEmail(),
                noticeEntity.getViewCnt(),
                noticeEntity.getCreateDttm()
        ));
    }



    //제목으로 검색
    @Override
    public Page<NoticeResponseDto> findByTitle(NoticeSearchRequestDto noticeSearchRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        Page<NoticeEntity> noticeEntityPage;

        switch (role) {
            case "ROLE_CONSULTANT":
                ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Consultant user not found with email: " + email));
                noticeEntityPage = noticeRepository.findByTitle(
                        noticeSearchRequestDto.getKeyword(),
                        consultantUser.getId(),
                        null,
                        noticeSearchRequestDto.getPageable()
                );
                break;

            case "ROLE_PARENT":
                ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Parent user not found with email: " + email));
                noticeEntityPage = noticeRepository.findByTitle(
                        noticeSearchRequestDto.getKeyword(),
                        null,
                        parentUser.getId(),
                        noticeSearchRequestDto.getPageable()
                );
                break;

            default:
                throw new RuntimeException("Invalid role: " + role);
        }

        return noticeEntityPage.map(noticeEntity -> new NoticeResponseDto(
                noticeEntity.getId(),
                noticeEntity.getTitle(),
                noticeEntity.getConsultantUser().getEmail(),
                noticeEntity.getViewCnt(),
                noticeEntity.getCreateDttm()
        ));
    }


    //작성자 이메일로 검색
    @Override
    public Page<NoticeResponseDto> findByEmail(NoticeSearchRequestDto noticeSearchRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Consultant user not found with email: " + email));

        Page<NoticeEntity> noticeEntityPage = noticeRepository.findByEmail(
                consultantUser.getId(),
                noticeSearchRequestDto.getPageable()
        );

        return noticeEntityPage.map(noticeEntity -> new NoticeResponseDto(
                noticeEntity.getId(),
                noticeEntity.getTitle(),
                noticeEntity.getConsultantUser().getEmail(),
                noticeEntity.getViewCnt(),
                noticeEntity.getCreateDttm()
        ));
    }


    //글 상세 보기
    @Override
    public NoticeDetailResponseDto findById(int noticeId) {
        NoticeEntity noticeEntity = noticeRepository.findById(noticeId);

        if (noticeEntity == null) {
            throw new RuntimeException("공지사항을 찾을 수 없습니다.");
        }

        updateViewCnt(noticeId); //조회수 증가
        
        return NoticeDetailResponseDto.builder()
                .id(noticeEntity.getId())
                .title(noticeEntity.getTitle())
                .content(noticeEntity.getContent())
                .consultantUserEmail(noticeEntity.getConsultantUser().getEmail())
                .viewCnt(noticeEntity.getViewCnt()+1)
                .createDttm(noticeEntity.getCreateDttm())
                .build();

    }

    // 조회수 증가
    @Override
    public void updateViewCnt(int id) {
        noticeRepository.updateViewCnt(id);
    }

    @Override
    public void createNotice(NoticeCreateRequestDto noticeCreateRequestDto, String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(token);

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Consultant user not found with email: " + email));

        NoticeEntity noticeEntity = NoticeEntity.builder()
                .title(noticeCreateRequestDto.getTitle())
                .content(noticeCreateRequestDto.getContent())
                .consultantUser(consultantUser)
                .build();

        noticeRepository.save(noticeEntity);
    }

    @Override
    public void deleteNotice(int noticeId, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);

        ConsultantUserEntity loginUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Can not find loginUser"));

        NoticeEntity noticeEntity = noticeRepository.findById(noticeId);
        if(noticeEntity == null) {
            throw new RuntimeException("can not find notice by id");
        }

        if(!Objects.equals(loginUser.getId(), noticeEntity.getConsultantUser().getId())) {
            throw new RuntimeException("Only Writer can be delete");
        }
        noticeRepository.deleteById(noticeId);
    }

    @Override
    public int updateNotice(NoticeUpdateRequestDto noticeUpdateRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);

        ConsultantUserEntity loginUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Can not find loginUser"));

        NoticeEntity noticeEntity = noticeRepository.findById(noticeUpdateRequestDto.getId());
        if(noticeEntity == null) {
            throw new RuntimeException("can not find notice");
        }

        if(!Objects.equals(loginUser.getId(), noticeEntity.getConsultantUser().getId())) {
            throw new RuntimeException("Only Writer can be update");
        }

        noticeEntity.setTitle(noticeUpdateRequestDto.getTitle());
        noticeEntity.setContent(noticeUpdateRequestDto.getContent());

        noticeRepository.save(noticeEntity);

        return noticeEntity.getId();
    }


}
