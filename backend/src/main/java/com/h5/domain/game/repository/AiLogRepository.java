package com.h5.domain.game.repository;

import com.h5.domain.game.entity.AiLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiLogRepository extends JpaRepository<AiLogEntity, Integer> {
}
