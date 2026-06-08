package com.accenture.smartquiz.repository;

import com.accenture.smartquiz.entity.TechnologyStack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TechnologyStackRepository extends JpaRepository<TechnologyStack, Long> {

    List<TechnologyStack> findByActiveTrue();

    boolean existsByStackNameIgnoreCase(String stackName);
}
