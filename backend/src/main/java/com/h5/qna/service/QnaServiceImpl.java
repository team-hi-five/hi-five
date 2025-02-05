package com.h5.qna.service;

import com.h5.consultant.entity.ConsultantUserEntity;
import com.h5.consultant.repository.ConsultantUserRepository;
import com.h5.global.exception.BoardAccessDeniedException;
import com.h5.global.exception.BoardNotFoundException;
import com.h5.global.exception.UserAccessDeniedException;
import com.h5.global.exception.UserNotFoundException;
import com.h5.parent.entity.ParentUserEntity;
import com.h5.parent.repository.ParentUserRepository;
import com.h5.qna.dto.request.QnaCommentCreateRequestDto;
import com.h5.qna.dto.request.QnaCreateRequestDto;
import com.h5.qna.dto.request.QnaSearchRequestDto;
import com.h5.qna.dto.request.QnaUpdateRequestDto;
import com.h5.qna.dto.response.*;
import com.h5.qna.entity.QnaAnswerEntity;
import com.h5.qna.entity.QnaEntity;
import com.h5.qna.repository.QnaAnswerRepository;
import com.h5.qna.repository.QnaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class QnaServiceImpl implements QnaService {
    private final QnaRepository qnaRepository;
    private final QnaAnswerRepository qnaAnswerRepository;
    private final ConsultantUserRepository consultantUserRepository;
    private final ParentUserRepository parentUserRepository;

    @Override
    public int createQna(QnaCreateRequestDto qnaCreateRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);

        if(!"ROLE_PARENT".equals(role)){
            throw new BoardAccessDeniedException("qna");
        }

        ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        QnaEntity qnaEntity = QnaEntity.builder()
                .title(qnaCreateRequestDto.getTitle())
                .content(qnaCreateRequestDto.getContent())
                .parentUser(parentUser)
                .build();

        qnaRepository.save(qnaEntity);
        return qnaEntity.getId();
    }

    // 전체 리스트 조회
    @Override
    public QnaListResponseDto findAll(QnaSearchRequestDto qnaSearchRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);

        Pageable pageable = PageRequest.of(
                qnaSearchRequestDto.getPageNumber(),
                qnaSearchRequestDto.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createDttm")
        );

        Integer parentUserId = null;
        Integer consultantUserId = null;

        if ("ROLE_PARENT".equals(role)) {
            parentUserId = parentUserRepository.findByEmail(email)
                    .orElseThrow(UserNotFoundException::new)
                    .getId();
        } else if ("ROLE_CONSULTANT".equals(role)) {
            consultantUserId = consultantUserRepository.findByEmail(email)
                    .orElseThrow(UserNotFoundException::new)
                    .getId();
        }else{
            throw new UserAccessDeniedException();
        }

        Page<QnaEntity> qnaEntityPage = qnaRepository.findAll(role, parentUserId, consultantUserId, pageable);

        return convertToResponseDto(qnaEntityPage);
    }


    // 제목 검색
    @Override
    public QnaListResponseDto findByTitle(QnaSearchRequestDto qnaSearchRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);
        Pageable pageable = PageRequest.of(
                qnaSearchRequestDto.getPageNumber(),
                qnaSearchRequestDto.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createDttm")
        );
        String title = qnaSearchRequestDto.getKeyword();
        Integer parentUserId = null;
        Integer consultantUserId = null;

        if ("ROLE_PARENT".equals(role)) {
            parentUserId = parentUserRepository.findByEmail(email)
                    .orElseThrow(UserNotFoundException::new)
                    .getId();
        } else if ("ROLE_CONSULTANT".equals(role)) {
            consultantUserId = consultantUserRepository.findByEmail(email)
                    .orElseThrow(UserNotFoundException::new)
                    .getId();
        }else{
            throw new UserAccessDeniedException();
        }

        Page<QnaEntity> qnaEntityPage = qnaRepository.findByTitle(role, parentUserId, consultantUserId, title, pageable);

        return convertToResponseDto(qnaEntityPage);
    }

    // 작성자 검색
    @Override
    public QnaListResponseDto findByName(QnaSearchRequestDto qnaSearchRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);
        Pageable pageable = PageRequest.of(
                qnaSearchRequestDto.getPageNumber(),
                qnaSearchRequestDto.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createDttm")
        );
        String searchName = qnaSearchRequestDto.getKeyword();
        Integer parentUserId = null;
        Integer consultantUserId = null;

        if ("ROLE_PARENT".equals(role)) {
            parentUserId = parentUserRepository.findByEmail(email)
                    .orElseThrow(UserNotFoundException::new)
                    .getId();
        }

        if ("ROLE_CONSULTANT".equals(role)) {
            consultantUserId = consultantUserRepository.findByEmail(email)
                    .orElseThrow(UserNotFoundException::new)
                    .getId();
        }

        Page<QnaEntity> qnaEntityPage = qnaRepository.findByName(role, parentUserId, consultantUserId, searchName, pageable);

        return convertToResponseDto(qnaEntityPage);
    }

    //상세조회
    @Override
    public QnaDetailResponseDto findById(int qnaId) {
        QnaEntity qnaEntity = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new BoardNotFoundException("qna"));

        QnaAnswerEntity qnaAnswerEntity = qnaAnswerRepository.findByQnaEntity_Id(qnaId)
                        .orElse(null);

        updateViewCnt(qnaId);

        QnaAnswerResponseDto qnaAnswerResponseDto = (qnaAnswerEntity != null) ?
                QnaAnswerResponseDto.builder()
                        .id(qnaAnswerEntity.getId())
                        .content(qnaAnswerEntity.getContent())
                        .createDttm(qnaAnswerEntity.getCreateDttm().toString())
                        .name(qnaAnswerEntity.getConsultantUser().getName())
                        .build()
                : null;

        return QnaDetailResponseDto.builder()
                .id(qnaEntity.getId())
                .title(qnaEntity.getTitle())
                .content(qnaEntity.getContent())
                .name(qnaEntity.getParentUser().getName())
                .createDttm(qnaEntity.getCreateDttm().toString())
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
    public int updateQna(QnaUpdateRequestDto qnaUpdateRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);
        QnaEntity qnaEntity = qnaRepository.findById(qnaUpdateRequestDto.getId())
                .orElseThrow(() -> new BoardNotFoundException("qna"));

        if(!Objects.equals(parentUser.getId(), qnaEntity.getParentUser().getId())) {
            throw new BoardAccessDeniedException("qna");
        }

        qnaEntity.setTitle(qnaUpdateRequestDto.getTitle());
        qnaEntity.setContent(qnaUpdateRequestDto.getContent());

        qnaRepository.save(qnaEntity);
        return qnaEntity.getId();
    }

    //글 삭제
    @Override
    public void deleteQna(int qnaId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        ParentUserEntity parentUser = parentUserRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        QnaEntity qnaEntity = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new BoardNotFoundException("qna"));

        if( !Objects.equals(parentUser.getId(), qnaEntity.getParentUser().getId())) {
            throw new BoardAccessDeniedException("qna");
        }

        qnaRepository.delete(qnaEntity);
    }

    @Override
    public int createQnaComment(QnaCommentCreateRequestDto qnaCommentCreateRequestDto) {
        QnaEntity qnaEntity = qnaRepository.findById(qnaCommentCreateRequestDto.getQnaId())
                .orElseThrow(() -> new BoardNotFoundException("qna"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);

        if(!"ROLE_CONSULTANT".equals(role)) {
            throw new UserAccessDeniedException();
        }

        ConsultantUserEntity consultantUser = consultantUserRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        QnaAnswerEntity qnaAnswerEntity = new QnaAnswerEntity().builder()
                .content(qnaCommentCreateRequestDto.getContent())
                .qnaEntity(qnaEntity)
                .consultantUser(consultantUser)
                .build();

        qnaAnswerRepository.save(qnaAnswerEntity);
        return qnaAnswerEntity.getId();
    }

    private QnaListResponseDto convertToResponseDto(Page<QnaEntity> qnaEntityPage) {
        List<QnaResponseDto> qnaResponses = qnaEntityPage.getContent().stream()
                .map(qnaEntity -> new QnaResponseDto(
                        qnaEntity.getId(),
                        qnaEntity.getTitle(),
                        qnaEntity.getParentUser().getEmail(),
                        qnaEntity.getViewCnt(),
                        qnaEntity.getCreateDttm().toString()
                )).toList();

        PaginationResponseDto pagination = new PaginationResponseDto(
                qnaEntityPage.getNumber(),
                qnaEntityPage.getSize(),
                qnaEntityPage.getTotalPages(),
                qnaEntityPage.getTotalElements()
        );

        return new QnaListResponseDto(qnaResponses, pagination);
    }
}
