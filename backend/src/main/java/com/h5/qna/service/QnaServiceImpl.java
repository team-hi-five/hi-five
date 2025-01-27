package com.h5.qna.service;

import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.util.JwtUtil;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import com.h5.qna.dto.request.QnaCreateRequestDto;
import com.h5.qna.dto.request.QnaRequestDto;
import com.h5.qna.dto.request.QnaUpdateRequestDto;
import com.h5.qna.dto.response.QnaAnswerResponseDto;
import com.h5.qna.dto.response.QnaDetailResponseDto;
import com.h5.qna.dto.response.QnaResponseDto;
import com.h5.qna.entity.QnaAnswerEntity;
import com.h5.qna.entity.QnaEntity;
import com.h5.qna.repository.QnaAnswerRepository;
import com.h5.qna.repository.QnaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class QnaServiceImpl implements QnaService {
    private final QnaRepository qnaRepository;
    private final QnaAnswerRepository qnaAnswerRepository;
    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void createQna(QnaCreateRequestDto qnaCreateRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("Can not find parentUser"));

        if(!role.equals("ROLE_PARENT")){
            throw new RuntimeException("Only ROLE_PARENT can create QNA");
        }

        QnaEntity qnaEntity = QnaEntity.builder()
                .title(qnaCreateRequestDto.getTitle())
                .content(qnaCreateRequestDto.getContent())
                .parentUser(parentUser)
                .build();

        qnaRepository.save(qnaEntity);
    }

    // 전체 리스트 조회
    @Override
    public Page<QnaResponseDto> findAll(QnaRequestDto qnaRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        Pageable pageable = qnaRequestDto.getPageable();
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

        Page<QnaEntity> qnaEntityPage = qnaRepository.findAll(role, parentUserId, consultantUserId, pageable);

        return qnaEntityPage.map(qnaEntity -> new QnaResponseDto(
                qnaEntity.getId(),
                qnaEntity.getTitle(),
                qnaEntity.getParentUser().getEmail(),
                qnaEntity.getViewCnt(),
                qnaEntity.getCreateDttm()
        ));
    }


    // 제목 검색
    @Override
    public Page<QnaResponseDto> findByTitle(QnaRequestDto qnaRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        Pageable pageable = qnaRequestDto.getPageable();
        String title = qnaRequestDto.getKeyword();
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

        Page<QnaEntity> qnaEntityPage = qnaRepository.findByTitle(role, parentUserId, consultantUserId, title, pageable);

        return qnaEntityPage.map(qnaEntity -> new QnaResponseDto(
                qnaEntity.getId(),
                qnaEntity.getTitle(),
                qnaEntity.getParentUser().getEmail(),
                qnaEntity.getViewCnt(),
                qnaEntity.getCreateDttm()
        ));
    }

    // 작성자 검색
    @Override
    public Page<QnaResponseDto> findByEmail(QnaRequestDto qnaRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);
        String role = jwtUtil.getRoleFromToken(accessToken);

        Pageable pageable = qnaRequestDto.getPageable();
        String searchEmail = qnaRequestDto.getKeyword();
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

        Page<QnaEntity> qnaEntityPage = qnaRepository.findByEmail(role, parentUserId, consultantUserId, searchEmail, pageable);

        return qnaEntityPage.map(qnaEntity -> new QnaResponseDto(
                qnaEntity.getId(),
                qnaEntity.getTitle(),
                qnaEntity.getParentUser().getEmail(),
                qnaEntity.getViewCnt(),
                qnaEntity.getCreateDttm()
        ));
    }

    //상세조회
    @Override
    public QnaDetailResponseDto findById(int qnaId) {
        QnaEntity qnaEntity = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("QnA not found"));

        QnaAnswerEntity qnaAnswerEntity = qnaAnswerRepository.findByBoardId(qnaId)
                        .orElse(null);

        updateViewCnt(qnaId);

        QnaAnswerResponseDto qnaAnswerResponseDto = (qnaAnswerEntity != null) ?
                QnaAnswerResponseDto.builder()
                        .id(qnaAnswerEntity.getId())
                        .content(qnaAnswerEntity.getContent())
                        .createDttm(qnaAnswerEntity.getCreateDttm())
                        .consultantEmail(qnaAnswerEntity.getConsultantUser().getEmail())
                        .build()
                : null;

        return QnaDetailResponseDto.builder()
                .id(qnaEntity.getId())
                .title(qnaEntity.getTitle())
                .content(qnaEntity.getContent())
                .parentUserEmail(qnaEntity.getParentUser().getEmail())
                .createDttm(qnaEntity.getCreateDttm())
                .viewCnt(qnaEntity.getViewCnt()+1)
                .qnaAnswerResponseDto(qnaAnswerResponseDto)
                .build();
    }

    //조회수 +1
    @Override
    public void updateViewCnt(int qnaId) {
        qnaRepository.updateViewCnt(qnaId);
    }

    //업데이트
    @Override
    public void updateQna(QnaUpdateRequestDto qnaUpdateRequestDto, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);

        ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid parent user"));
        QnaEntity qnaEntity = qnaRepository.findById(qnaUpdateRequestDto.getId())
                .orElseThrow(() -> new RuntimeException("QnA not found"));

        if(!Objects.equals(parentUser.getId(), qnaEntity.getParentUser().getId())) {
            throw new RuntimeException("Only Writer Can Update Qna");
        }

        qnaEntity.setTitle(qnaUpdateRequestDto.getTitle());
        qnaEntity.setContent(qnaUpdateRequestDto.getContent());

        qnaRepository.save(qnaEntity);
    }

    //글 삭제
    @Override
    public void deleteQna(int qnaId, String authorizationHeader) {
        String accessToken = authorizationHeader.replace("Bearer ", "");
        String email = jwtUtil.getEmailFromToken(accessToken);

        ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid parent user"));

        QnaEntity qnaEntity = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("QnA not found"));

        if( !Objects.equals(parentUser.getId(), qnaEntity.getParentUser().getId())) {
            throw new RuntimeException("Only Writer can delete QnA");
        }

        qnaRepository.delete(qnaEntity);
    }
}
