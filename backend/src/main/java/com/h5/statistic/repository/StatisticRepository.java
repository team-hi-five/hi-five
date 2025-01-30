package com.h5.statistic.repository;

import com.h5.statistic.entity.StatisticEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatisticRepository extends JpaRepository<StatisticEntity, Integer> {
    StatisticEntity findByEmotion_IdAndChildUser_Id(int emotionEntityId, int childUserId);
}
