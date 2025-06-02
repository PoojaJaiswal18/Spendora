package com.jaiswal.repository;

import com.jaiswal.model.document.CommunityInsight;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityInsightRepository extends MongoRepository<CommunityInsight, String> {

    @Query("{'insightType': ?0, 'period': ?1, 'validUntil': {'$gte': ?2}}")
    Optional<CommunityInsight> findValidInsight(String insightType, String period, LocalDateTime currentDate);

    List<CommunityInsight> findByInsightTypeAndPeriodOrderByGeneratedAtDesc(String insightType, String period);

    @Query("{'validUntil': {'$lt': ?0}}")
    List<CommunityInsight> findExpiredInsights(LocalDateTime currentDate);

    @Query("{'category': ?0, 'validUntil': {'$gte': ?1}}")
    List<CommunityInsight> findValidInsightsByCategory(String category, LocalDateTime currentDate);

    void deleteByValidUntilBefore(LocalDateTime date);

    // Added missing method
    Optional<CommunityInsight> findTopByOrderByGeneratedAtDesc();

    // Additional useful methods
    @Query("{'insightType': ?0, 'validUntil': {'$gte': ?1}}")
    List<CommunityInsight> findValidInsightsByType(String insightType, LocalDateTime currentDate);

    @Query("{'period': ?0, 'validUntil': {'$gte': ?1}}")
    List<CommunityInsight> findValidInsightsByPeriod(String period, LocalDateTime currentDate);

    long countByInsightTypeAndPeriod(String insightType, String period);
}
