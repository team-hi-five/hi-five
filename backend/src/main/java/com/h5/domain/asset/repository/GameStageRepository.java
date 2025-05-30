package com.h5.domain.asset.repository;

import com.h5.domain.asset.entity.GameStageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameStageRepository extends JpaRepository<GameStageEntity, Integer> {


}
