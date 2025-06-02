package com.jaiswal.repository;

import com.jaiswal.model.document.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {

    @Query("{'$or': [{'userId': ?0}, {'userId': null}], 'isActive': true}")
    List<Category> findByUserIdOrUserIdIsNullOrderByNameAsc(String userId);

    boolean existsByUserIdAndNameIgnoreCase(String userId, String name);

    @Query(value = "{'userId': ?0, 'isActive': true}", count = true)
    long countActiveByUserId(String userId);

    List<Category> findByUserIdAndIsActiveTrue(String userId);

    List<Category> findByUserIdAndParentCategoryId(String userId, String parentCategoryId);

    @Query("{'userId': ?0, 'keywords': {'$in': [?1]}}")
    List<Category> findByUserIdAndKeywordsContaining(String userId, String keyword);
}
