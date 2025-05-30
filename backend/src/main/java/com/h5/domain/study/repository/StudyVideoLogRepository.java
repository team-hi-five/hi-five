package com.h5.domain.study.repository;

import com.h5.domain.study.entity.StudyVideoLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyVideoLogRepository extends JpaRepository<StudyVideoLogEntity, Integer> {
}
