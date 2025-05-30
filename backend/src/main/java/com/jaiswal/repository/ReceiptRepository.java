package com.jaiswal.repository;

import com.jaiswal.model.document.Receipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends MongoRepository<Receipt, String> {

    Page<Receipt> findByUserIdOrderByDateDesc(String userId, Pageable pageable);

    List<Receipt> findByUserIdAndDateBetweenOrderByDateDesc(
            String userId, LocalDate startDate, LocalDate endDate);

    List<Receipt> findByUserIdAndCategoryIdOrderByDateDesc(String userId, String categoryId);

    @Query("{'userId': ?0, 'merchantName': {'$regex': ?1, '$options': 'i'}}")
    List<Receipt> findByUserIdAndMerchantNameContainingIgnoreCase(String userId, String merchantName);

    @Query("{'userId': ?0, 'totalAmount': {'$gte': ?1, '$lte': ?2}}")
    List<Receipt> findByUserIdAndTotalAmountBetween(String userId, BigDecimal minAmount, BigDecimal maxAmount);

    @Aggregation(pipeline = {
            "{'$match': {'userId': ?0, 'date': {'$gte': ?1, '$lte': ?2}}}",
            "{'$group': {'_id': '$categoryId', 'totalAmount': {'$sum': '$totalAmount'}, 'count': {'$sum': 1}}}",
            "{'$sort': {'totalAmount': -1}}"
    })
    List<CategorySpendingAggregation> getCategorySpendingByUserAndDateRange(
            String userId, LocalDate startDate, LocalDate endDate);

    @Aggregation(pipeline = {
            "{'$match': {'userId': ?0, 'date': {'$gte': ?1, '$lte': ?2}}}",
            "{'$group': {'_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$date'}}, 'totalAmount': {'$sum': '$totalAmount'}, 'count': {'$sum': 1}}}",
            "{'$sort': {'_id': 1}}"
    })
    List<DailySpendingAggregation> getDailySpendingByUserAndDateRange(
            String userId, LocalDate startDate, LocalDate endDate);

    @Query(value = "{'userId': ?0, 'date': {'$gte': ?1, '$lte': ?2}}", count = true)
    long countByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);

    @Aggregation(pipeline = {
            "{'$match': {'userId': ?0, 'date': {'$gte': ?1, '$lte': ?2}}}",
            "{'$group': {'_id': null, 'totalAmount': {'$sum': '$totalAmount'}, 'avgAmount': {'$avg': '$totalAmount'}, 'count': {'$sum': 1}}}"
    })
    Optional<SpendingSummaryAggregation> getSpendingSummaryByUserAndDateRange(
            String userId, LocalDate startDate, LocalDate endDate);

    interface CategorySpendingAggregation {
        String get_id(); // categoryId
        BigDecimal getTotalAmount();
        Integer getCount();
    }

    interface DailySpendingAggregation {
        String get_id(); // date string
        BigDecimal getTotalAmount();
        Integer getCount();
    }

    interface SpendingSummaryAggregation {
        BigDecimal getTotalAmount();
        BigDecimal getAvgAmount();
        Integer getCount();
    }
}

