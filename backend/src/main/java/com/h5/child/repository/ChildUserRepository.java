package com.h5.child.repository;

import com.h5.child.entity.ChildUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChildUserRepository extends JpaRepository<ChildUserEntity, Integer> {

}
