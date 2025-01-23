package com.h5.notice.service;

import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.notice.dto.request.NoticeCreateRequestDto;
import com.h5.notice.dto.request.NoticeDeleteRequestDto;
import com.h5.notice.dto.request.NoticeUpdateRequestDto;
import com.h5.notice.dto.response.NoticeDetailResponseDto;
import com.h5.notice.dto.response.NoticeResponseDto;
import com.h5.notice.entity.NoticeEntity;
import com.h5.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Transactional

public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;
    private final ConsultantUserRepository ConsultantUserRepository;

    //전체 글 리스트
    @Override
    public Page<NoticeResponseDto> findAllByDeleteDttmIsNull(Pageable pageable) {

        Page<NoticeEntity> noticeEntityPage = noticeRepository.findAllByDeleteDttmIsNull(pageable);

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
    public Page<NoticeResponseDto> findByTitle(String title, Pageable pageable) {
        Page<NoticeEntity> noticeEntityPage = noticeRepository.findByTitle(title, pageable);

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
    public Page<NoticeResponseDto> findByEmail(String consultantUserEmail, Pageable pageable) {
        Page<NoticeEntity> noticeEntityPage = noticeRepository.findByEmail(consultantUserEmail, pageable);

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
    public int createNotice(NoticeCreateRequestDto requestDto) {
        ConsultantUserEntity consultantUser = ConsultantUserRepository.findByEmail(requestDto.getConsultantUserEmail())
         .orElseThrow(() -> new RuntimeException("작성자 이메일에 해당하는 사용자를 찾을 수 없습니다."));

        NoticeEntity noticeEntity = NoticeEntity.builder()
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .consultantUser(consultantUser)
                .build();
        noticeRepository.save(noticeEntity);

        if(noticeEntity.getId() == null) {
            return 0;
        }

        return 1;
    }

    @Override
    public int deleteNotice(NoticeDeleteRequestDto requestDto) {
        return 0;
    }

    @Override
    public int updateNotice(NoticeUpdateRequestDto requestDto) {
        return 0;
    }


}
