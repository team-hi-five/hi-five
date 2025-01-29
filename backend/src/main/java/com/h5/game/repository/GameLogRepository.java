package com.h5.game.repository;

import com.h5.game.entity.GameLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameLogRepository extends JpaRepository<GameLogEntity, Integer> {
}
