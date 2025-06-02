package com.jaiswal.repository;

import com.jaiswal.model.document.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("{'$or': [{'username': ?0}, {'email': ?0}]}")
    Optional<User> findByUsernameOrEmail(String usernameOrEmail);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("{'enabled': true, 'lastLoginAt': {'$gte': ?0}}")
    List<User> findActiveUsersSince(LocalDateTime since);

    @Query(value = "{'roles': ?0}", count = true)
    long countByRole(String role);
}
