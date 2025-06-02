package com.jaiswal.repository;

import com.jaiswal.model.document.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChallengeRepository extends MongoRepository<Challenge, String> {

    @Query("{'status': 'ACTIVE', 'startDate': {'$lte': ?0}, 'endDate': {'$gte': ?0}}")
    List<Challenge> findActiveChallenges(LocalDateTime currentDate);

    // Overloaded method without parameter for backward compatibility
    default List<Challenge> findActiveChallenges() {
        return findActiveChallenges(LocalDateTime.now());
    }

    Page<Challenge> findByStatusOrderByCreatedAtDesc(Challenge.ChallengeStatus status, Pageable pageable);

    @Query("{'type': ?0, 'status': 'ACTIVE'}")
    List<Challenge> findActiveChallengesByType(Challenge.ChallengeType type);

    @Query("{'createdBy': ?0}")
    List<Challenge> findByCreatedBy(String createdBy);

    @Query("{'endDate': {'$lt': ?0}, 'status': 'ACTIVE'}")
    List<Challenge> findExpiredChallenges(LocalDateTime currentDate);

    long countByStatus(Challenge.ChallengeStatus status);

    // Additional useful methods
    List<Challenge> findByStatusAndStartDateBeforeAndEndDateAfter(
            Challenge.ChallengeStatus status, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'categoryIds': {'$in': [?0]}, 'status': 'ACTIVE'}")
    List<Challenge> findActiveChallengesByCategory(String categoryId);
}
