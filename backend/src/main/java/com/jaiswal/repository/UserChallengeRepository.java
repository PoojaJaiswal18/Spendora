package com.jaiswal.repository;

import com.jaiswal.model.document.UserChallenge;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserChallengeRepository extends MongoRepository<UserChallenge, String> {

    List<UserChallenge> findByUserIdAndStatus(String userId, UserChallenge.UserChallengeStatus status);

    Optional<UserChallenge> findByUserIdAndChallengeId(String userId, String challengeId);

    @Query("{'challengeId': ?0, 'status': 'COMPLETED'}")
    List<UserChallenge> findCompletedByChallengeId(String challengeId);

    @Aggregation(pipeline = {
            "{'$match': {'challengeId': ?0, 'status': 'ACTIVE'}}",
            "{'$sort': {'currentSpending': 1}}",
            "{'$limit': 10}"
    })
    List<UserChallenge> findLeaderboardByChallengeId(String challengeId);

    @Query(value = "{'userId': ?0, 'status': 'ACTIVE'}", count = true)
    long countActiveByUserId(String userId);

    @Query(value = "{'challengeId': ?0, 'status': 'ACTIVE'}", count = true)
    long countActiveByChallengeId(String challengeId);
}

