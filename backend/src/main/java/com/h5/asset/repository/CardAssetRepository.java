package com.h5.asset.repository;

import com.h5.asset.entity.CardAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardAssetRepository extends JpaRepository<CardAssetEntity, Integer> {
}
