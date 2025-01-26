package com.h5.child.repository;

import com.h5.child.entity.ChildUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ChildUserRepository extends JpaRepository<ChildUserEntity, Integer> {
    Optional<List<ChildUserEntity>> findByConsultantUserEntity_Id(Integer consultantUserEntityId);

    Optional<ChildUserEntity> findByIdAndConsultantUserEntity_Id(int childUserId, int consultantId);

    Optional<List<ChildUserEntity>> findByParentUserEntity_Id(Integer parentUserEntityId);

    void updateDeleteDttmForChildUsers(Set<Integer> childUserIds, String deleteDttm);
}
