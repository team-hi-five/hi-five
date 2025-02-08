package com.h5.asset.repository;

import com.h5.asset.entity.GameStageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GameStageRepository extends JpaRepository<GameStageEntity, Integer> {

    @Query("SELECT g.crtAns FROM GameStageEntity g WHERE g.id = :gameStageId AND g.gameChapterEntity.id = :gameChapterId")
    Integer findCrtAnsByIdAndGameChapterId(@Param("gameStageId") Integer gameStageId, @Param("gameChapterId") Integer gameChapterId);
}
