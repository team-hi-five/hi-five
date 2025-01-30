package com.h5.study.repository;

import com.h5.study.entity.StudyLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyLogRepository extends JpaRepository<StudyLogEntity, Integer> {
}
