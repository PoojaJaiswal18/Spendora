package com.jaiswal.model.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_challenges")
@CompoundIndex(def = "{'userId': 1, 'challengeId': 1}", unique = true)
public class UserChallenge {

    @Id
    private String id;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Challenge ID is required")
    private String challengeId;

    @CreatedDate
    private LocalDateTime joinedAt;

    @Builder.Default
    private UserChallengeStatus status = UserChallengeStatus.ACTIVE;

    @Builder.Default
    private BigDecimal currentSpending = BigDecimal.ZERO;

    @Builder.Default
    private Integer currentCount = 0; // for receipt count challenges

    private LocalDateTime completedAt;

    private List<ChallengeProgress> progressHistory;

    private Map<String, Object> achievements;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum UserChallengeStatus {
        ACTIVE, COMPLETED, FAILED, ABANDONED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeProgress {
        private LocalDateTime timestamp;
        private BigDecimal amount;
        private String receiptId;
        private String description;
        private Map<String, Object> metadata;
    }
}

