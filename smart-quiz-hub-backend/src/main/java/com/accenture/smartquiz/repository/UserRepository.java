package com.accenture.smartquiz.repository;

import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEnterpriseId(String enterpriseId);

    Optional<User> findByEmail(String email);

    boolean existsByEnterpriseId(String enterpriseId);

    boolean existsByEmail(String email);

    List<User> findByRoleAndActiveTrue(UserRole role);

    @Query("SELECT u FROM User u JOIN u.stackMappings sm WHERE sm.stack.id = :stackId AND u.active = true AND u.role = 'SME'")
    List<User> findSmesByStackId(@Param("stackId") Long stackId);
}
