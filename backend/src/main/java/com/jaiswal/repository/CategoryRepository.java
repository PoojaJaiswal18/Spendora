package com.jaiswal.repository;

import com.jaiswal.model.document.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {

    List<Category> findByUserIdOrUserIdIsNullOrderByNameAsc(String userId);

    List<Category> findByUserIdAndIsActiveTrue(String userId);

    @Query("{'$or': [{'userId': ?0}, {'userId': null}], 'isDefault': true}")
    List<Category> findDefaultCategoriesByUserId(String userId);

    Optional<Category> findByUserIdAndNameIgnoreCase(String userId, String name);

    List<Category> findByParentCategoryId(String parentCategoryId);

    @Query("{'keywords': {'$in': [?0]}}")
    List<Category> findByKeywordsContaining(String keyword);

    boolean existsByUserIdAndNameIgnoreCase(String userId, String name);

    @Query(value = "{'userId': ?0, 'isActive': true}", count = true)
    long countActiveByUserId(String userId);
}

