package com.h5.statistic.repository;

import com.h5.statistic.entity.ChatBotDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotRepository extends MongoRepository<ChatBotDocument, String> {
    List<ChatBotDocument> findByChildUserId(int childUserId);
}
