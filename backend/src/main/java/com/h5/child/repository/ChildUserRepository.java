package com.h5.child.repository;

import com.h5.child.entity.ChildUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChildUserRepository extends JpaRepository<ChildUserEntity, Integer> {
    Optional<List<ChildUserEntity>> findByConsultantUserEntity_Id(Integer consultantUserEntityId);

    Optional<ChildUserEntity> findByIdAndConsultantUserEntity_Id(int childUserId, int consultantId);

}
