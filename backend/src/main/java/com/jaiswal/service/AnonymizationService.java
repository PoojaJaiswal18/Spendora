package com.jaiswal.service;

import com.jaiswal.model.document.Receipt;
import com.jaiswal.model.document.CommunityInsight;
import com.jaiswal.repository.ReceiptRepository;
import com.jaiswal.repository.CommunityInsightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnonymizationService {

    private final ReceiptRepository receiptRepository;
    private final CommunityInsightRepository communityInsightRepository;

    @Autowired
    public AnonymizationService(ReceiptRepository receiptRepository, CommunityInsightRepository communityInsightRepository) {
        this.receiptRepository = receiptRepository;
        this.communityInsightRepository = communityInsightRepository;
    }

    // Aggregates and anonymizes spending data for community insights
    public void anonymizeAndAggregate() {
        List<Receipt> receipts = receiptRepository.findAll();
        Map<String, Double> categoryTotals = receipts.stream()
                .collect(Collectors.groupingBy(
                        Receipt::getCategory,
                        Collectors.summingDouble(Receipt::getAmount)
                ));

        CommunityInsight insight = new CommunityInsight();
        insight.setTimestamp(new Date());
        insight.setCategoryTotals(categoryTotals);
        // Add more anonymized aggregations as needed

        communityInsightRepository.save(insight);
    }

    // Returns anonymized community insights for frontend display
    public CommunityInsight getLatestCommunityInsight() {
        return communityInsightRepository.findTopByOrderByTimestampDesc()
                .orElse(new CommunityInsight());
    }
}

