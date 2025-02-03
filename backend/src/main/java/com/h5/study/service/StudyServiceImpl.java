package com.h5.study.service;

import com.h5.study.repository.ChildStudyChapterRepository;
import com.h5.study.repository.ChildStudyStageRepository;
import com.h5.study.repository.StudyLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudyServiceImpl implements StudyService {
    private final ChildStudyChapterRepository childStudyChapterRepository;
    private final ChildStudyStageRepository childStudyStageRepository;
    private final StudyLogRepository studyLogRepository;

    @Autowired
    public StudyServiceImpl(ChildStudyChapterRepository childStudyChapterRepository,
                            ChildStudyStageRepository childStudyStageRepository,
                            StudyLogRepository studyLogRepository) {
        this.childStudyChapterRepository = childStudyChapterRepository;
        this.childStudyStageRepository = childStudyStageRepository;
        this.studyLogRepository = studyLogRepository;
    }
}
