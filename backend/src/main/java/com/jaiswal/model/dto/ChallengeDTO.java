package com.jaiswal.model.dto;

import com.jaiswal.model.document.Challenge;
import com.jaiswal.model.document.UserChallenge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
public class ChallengeDTO {

    private String id;

    @NotBlank(message = "Challenge title is required")
    private String title;

    @NotBlank(message = "Challenge description is required")
    private String description;

    @NotNull(message = "Challenge type is required")
    private Challenge.ChallengeType type;

    @Positive(message = "Target amount must be positive")
    private BigDecimal targetAmount;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationDays;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<String> categoryIds;
    private String createdBy;
    private Challenge.ChallengeStatus status;
    private Challenge.ChallengeReward reward;
    private Map<String, Object> rules;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User-specific fields
    private boolean isParticipating;
    private UserChallenge.UserChallengeStatus userStatus;
    private BigDecimal currentSpending;
    private Integer currentCount;
    private LocalDateTime joinedAt;
    private LocalDateTime completedAt;
    private Double progressPercentage;

    // Static factory methods
    public static ChallengeDTO from(Challenge challenge, List<UserChallenge> userChallenges) {
        ChallengeDTO dto = from(challenge);

        // Find user's participation in this challenge
        UserChallenge userChallenge = userChallenges.stream()
                .filter(uc -> uc.getChallengeId().equals(challenge.getId()))
                .findFirst()
                .orElse(null);

        if (userChallenge != null) {
            dto.setParticipating(true);
            dto.setUserStatus(userChallenge.getStatus());
            dto.setCurrentSpending(userChallenge.getCurrentSpending());
            dto.setCurrentCount(userChallenge.getCurrentCount());
            dto.setJoinedAt(userChallenge.getJoinedAt());
            dto.setCompletedAt(userChallenge.getCompletedAt());
            dto.setProgressPercentage(calculateProgress(challenge, userChallenge));
        } else {
            dto.setParticipating(false);
            dto.setProgressPercentage(0.0);
        }

        return dto;
    }

    public static ChallengeDTO from(Challenge challenge, UserChallenge userChallenge) {
        ChallengeDTO dto = from(challenge);

        if (userChallenge != null) {
            dto.setParticipating(true);
            dto.setUserStatus(userChallenge.getStatus());
            dto.setCurrentSpending(userChallenge.getCurrentSpending());
            dto.setCurrentCount(userChallenge.getCurrentCount());
            dto.setJoinedAt(userChallenge.getJoinedAt());
            dto.setCompletedAt(userChallenge.getCompletedAt());
            dto.setProgressPercentage(calculateProgress(challenge, userChallenge));
        }

        return dto;
    }

    public static ChallengeDTO from(Challenge challenge) {
        return ChallengeDTO.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .type(challenge.getType())
                .targetAmount(challenge.getTargetAmount())
                .durationDays(challenge.getDurationDays())
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .categoryIds(challenge.getCategoryIds())
                .createdBy(challenge.getCreatedBy())
                .status(challenge.getStatus())
                .reward(challenge.getReward())
                .rules(challenge.getRules())
                .maxParticipants(challenge.getMaxParticipants())
                .currentParticipants(challenge.getCurrentParticipants())
                .createdAt(challenge.getCreatedAt())
                .updatedAt(challenge.getUpdatedAt())
                .build();
    }

    private static Double calculateProgress(Challenge challenge, UserChallenge userChallenge) {
        if (challenge.getType() == Challenge.ChallengeType.SPENDING_LIMIT ||
                challenge.getType() == Challenge.ChallengeType.CATEGORY_LIMIT) {

            if (challenge.getTargetAmount() != null && challenge.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
                return (userChallenge.getCurrentSpending().doubleValue() / challenge.getTargetAmount().doubleValue()) * 100;
            }
        } else if (challenge.getType() == Challenge.ChallengeType.RECEIPT_COUNT) {
            if (challenge.getTargetAmount() != null && challenge.getTargetAmount().intValue() > 0) {
                return (userChallenge.getCurrentCount().doubleValue() / challenge.getTargetAmount().doubleValue()) * 100;
            }
        }
        return 0.0;
    }
}

