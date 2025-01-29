package com.h5.asset.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameChapterRepository extends JpaRepository<GameChapterRepository, Integer> {
}
