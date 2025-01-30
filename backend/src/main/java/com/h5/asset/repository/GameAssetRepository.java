package com.h5.asset.repository;

import com.h5.asset.entity.GameAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameAssetRepository extends JpaRepository<GameAssetEntity, Integer> {
}
