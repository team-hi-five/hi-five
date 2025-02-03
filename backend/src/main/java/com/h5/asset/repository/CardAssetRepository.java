package com.h5.asset.repository;

import com.h5.asset.entity.CardAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardAssetRepository extends JpaRepository<CardAssetEntity, Integer> {
    @Query("SELECT c FROM CardAssetEntity c " +
            "JOIN GameStageEntity s ON c.gameStageEntity.id = s.id " +
            "WHERE s.gameChapterEntity.id = :gameChapterId AND s.stage = :stage")
    List<CardAssetEntity> findCardAssetByChapterAndStage(@Param("Chapter") int chapter, @Param("Stage") int stage);
}
