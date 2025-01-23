package com.h5.parent.repository;

import com.h5.parent.entity.ParentUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface ParentUserRepository extends JpaRepository<ParentUserEntity, Long> {
    Optional<ParentUserEntity> findByEmail(String email);

    @Modifying
    int updateRefreshTokenByEmail(String email, String refreshToken);
}
