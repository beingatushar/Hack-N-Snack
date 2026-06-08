package com.accenture.smartquiz.repository;

import com.accenture.smartquiz.entity.UserStackMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserStackMappingRepository extends JpaRepository<UserStackMapping, Long> {

    List<UserStackMapping> findByUserId(Long userId);

    boolean existsByUserIdAndStackId(Long userId, Long stackId);

    void deleteByUserIdAndStackId(Long userId, Long stackId);
}
