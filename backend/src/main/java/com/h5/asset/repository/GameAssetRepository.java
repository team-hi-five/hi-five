package com.h5.asset.repository;

import com.h5.asset.entity.GameAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameAssetRepository extends JpaRepository<GameAssetEntity, Integer> {

    @Query("SELECT g FROM GameAssetEntity g " +
            "JOIN GameStageEntity s ON g.gameStageEntity.id = s.id " +
            "WHERE s.id = :gameChapterId AND s.stage = :stage")
    Optional<GameAssetEntity> findGameAssetByChapterAndStage(@Param("gameChapterId") int gameChapterId,
                                                            @Param("stage") int stage);
}
