package com.h5.consultant.repository;

import com.h5.consultant.entity.ConsultantUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface ConsultantUserRepository extends JpaRepository<ConsultantUserEntity, Integer> {
    Optional<ConsultantUserEntity> findByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE ConsultantUserEntity c SET c.refreshToken = :refreshToken WHERE c.email = :email")
    int updateRefreshTokenByEmail(@Param("email") String email, @Param("refreshToken") String refreshToken);

    Optional<ConsultantUserEntity> findEmailByNameAndPhone(String name, String phone);
}
