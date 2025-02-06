package com.h5.asset.repository;

import com.h5.asset.entity.CardAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardAssetRepository extends JpaRepository<CardAssetEntity, Integer> {

    @Query("""
    SELECT ca FROM CardAssetEntity ca
    JOIN ca.gameStageEntity gs
    WHERE gs.gameChapterEntity.id < :chapter
       OR (gs.gameChapterEntity.id = :chapter AND gs.stage <= :stage)
    ORDER BY gs.gameChapterEntity.id, gs.stage
    """)
    List<CardAssetEntity> findCardAssetByChapterAndStage(@Param("chapter") int chapter, @Param("stage") int stage);
}
