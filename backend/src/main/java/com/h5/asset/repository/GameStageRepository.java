package com.h5.asset.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameStageRepository extends JpaRepository<GameStageRepository, Integer> {
}
