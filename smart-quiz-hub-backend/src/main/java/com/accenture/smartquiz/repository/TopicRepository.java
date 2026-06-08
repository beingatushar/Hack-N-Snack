package com.accenture.smartquiz.repository;

import com.accenture.smartquiz.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findByStackId(Long stackId);

    List<Topic> findByStackIdAndActiveTrue(Long stackId);

    Optional<Topic> findByStackIdAndTopicNameIgnoreCase(Long stackId, String topicName);

    boolean existsByStackIdAndTopicNameIgnoreCase(Long stackId, String topicName);
}
