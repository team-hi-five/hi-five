package com.h5.game.repository;

import com.h5.game.entity.ChildGameStageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChildGameStageRepository extends JpaRepository<ChildGameStageEntity, Integer> {
}
