package com.jaiswal.service;

import com.jaiswal.model.dto.ChallengeDTO;
import com.jaiswal.model.document.Challenge;
import com.jaiswal.model.document.UserChallenge;
import com.jaiswal.repository.ChallengeRepository;
import com.jaiswal.repository.UserChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;

    @Cacheable(value = "challenges", key = "#userId")
    public List<ChallengeDTO> getAllChallenges(String userId) {
        List<Challenge> challenges = challengeRepository.findActiveChallenges(LocalDateTime.now());
        List<UserChallenge> userChallenges = userChallengeRepository.findByUserId(userId);

        return challenges.stream()
                .map(ch -> ChallengeDTO.from(ch, userChallenges))
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "challenges", key = "#userId")
    public void joinChallenge(String userId, String challengeId) {
        if (!userChallengeRepository.existsByUserIdAndChallengeId(userId, challengeId)) {
            UserChallenge uc = UserChallenge.builder()
                    .userId(userId)
                    .challengeId(challengeId)
                    .currentSpending(java.math.BigDecimal.ZERO)
                    .currentCount(0)
                    .status(UserChallenge.UserChallengeStatus.ACTIVE)
                    .build();
            userChallengeRepository.save(uc);
            log.info("User {} joined challenge {}", userId, challengeId);
        }
    }

    public ChallengeDTO getProgress(String userId, String challengeId) {
        UserChallenge uc = userChallengeRepository.findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Not participating in this challenge"));
        Challenge ch = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        return ChallengeDTO.from(ch, uc);
    }

    @Transactional
    public void completeChallenge(String userId, String challengeId) {
        UserChallenge uc = userChallengeRepository.findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Not participating in this challenge"));
        uc.setStatus(UserChallenge.UserChallengeStatus.COMPLETED);
        uc.setCompletedAt(LocalDateTime.now());
        userChallengeRepository.save(uc);
        log.info("User {} completed challenge {}", userId, challengeId);
    }

    @Cacheable(value = "leaderboards", key = "#challengeId")
    public List<ChallengeDTO> getLeaderboard(String challengeId) {
        List<UserChallenge> participants = userChallengeRepository.findByChallengeIdOrderByProgressDesc(challengeId);
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        return participants.stream()
                .map(uc -> ChallengeDTO.from(challenge, uc))
                .collect(Collectors.toList());
    }

    public List<ChallengeDTO> getUserActiveChallenges(String userId) {
        List<UserChallenge> userChallenges = userChallengeRepository.findByUserIdAndStatus(
                userId, UserChallenge.UserChallengeStatus.ACTIVE);

        return userChallenges.stream()
                .map(uc -> {
                    Challenge challenge = challengeRepository.findById(uc.getChallengeId())
                            .orElse(null);
                    return challenge != null ? ChallengeDTO.from(challenge, uc) : null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateProgress(String userId, String challengeId, java.math.BigDecimal amount) {
        Optional<UserChallenge> optionalUc = userChallengeRepository.findByUserIdAndChallengeId(userId, challengeId);
        if (optionalUc.isPresent()) {
            UserChallenge uc = optionalUc.get();
            uc.setCurrentSpending(uc.getCurrentSpending().add(amount));
            userChallengeRepository.save(uc);
        }
    }
}
