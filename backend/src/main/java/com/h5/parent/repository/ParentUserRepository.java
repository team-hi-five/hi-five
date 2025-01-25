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

    @Modifying
    @Transactional
    @Query("UPDATE ParentUserEntity c SET c.refreshToken = :refreshToken WHERE c.email = :email")
    int updateRefreshTokenByEmail(@Param("email") String email, @Param("refreshToken") String refreshToken);

    @Query("SELECT c.name FROM ParentUserEntity c WHERE c.id = :id")
    Optional<String> findNameById(@Param("id") Integer id);
}
