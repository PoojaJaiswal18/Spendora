package com.jaiswal.model.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "challenges")
public class Challenge {

    @Id
    private String id;

    @NotBlank(message = "Challenge title is required")
    private String title;

    @NotBlank(message = "Challenge description is required")
    private String description;

    @NotNull(message = "Challenge type is required")
    private ChallengeType type;

    @Positive(message = "Target amount must be positive")
    private BigDecimal targetAmount;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationDays;

    @NotNull(message = "Start date is required")
    @Indexed
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    @Indexed
    private LocalDateTime endDate;

    private List<String> categoryIds; // applicable categories

    private String createdBy; // user ID or "SYSTEM"

    @Builder.Default
    private ChallengeStatus status = ChallengeStatus.ACTIVE;

    private ChallengeReward reward;

    private Map<String, Object> rules; // additional challenge rules

    @Builder.Default
    private Integer maxParticipants = 1000;

    @Builder.Default
    private Integer currentParticipants = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ChallengeType {
        SPENDING_LIMIT,     // Don't exceed X amount
        CATEGORY_LIMIT,     // Don't exceed X in specific category
        NO_SPEND,          // Don't spend in specific category
        SAVINGS_GOAL,      // Save X amount
        RECEIPT_COUNT      // Upload X receipts
    }

    public enum ChallengeStatus {
        DRAFT, ACTIVE, COMPLETED, CANCELLED, EXPIRED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeReward {
        private String type; // BADGE, POINTS, DISCOUNT
        private String title;
        private String description;
        private String imageUrl;
        private Integer points;
        private Map<String, Object> metadata;
    }
}

