package com.h5.parent.repository;

import com.h5.parent.entity.ParentUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ParentUserRepository extends JpaRepository<ParentUserEntity, Integer> {
    Optional<ParentUserEntity> findByEmail(String email);

    Optional<ParentUserEntity> findEmailByNameAndPhone(String name, String phone);

    Optional<ParentUserEntity> findByEmailAndDeleteDttmIsNull(String email);
}
