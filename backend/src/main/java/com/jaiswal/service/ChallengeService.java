package com.jaiswal.service;

import com.jaiswal.model.dto.ChallengeDTO;
import com.jaiswal.model.document.Challenge;
import com.jaiswal.model.document.UserChallenge;
import com.jaiswal.repository.ChallengeRepository;
import com.jaiswal.repository.UserChallengeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;

    @Autowired
    public ChallengeService(ChallengeRepository challengeRepository, UserChallengeRepository userChallengeRepository) {
        this.challengeRepository = challengeRepository;
        this.userChallengeRepository = userChallengeRepository;
    }

    @Cacheable(value = "challenges", key = "#userId")
    public List<ChallengeDTO> getAllChallenges(String userId) {
        List<Challenge> challenges = challengeRepository.findActiveChallenges();
        List<UserChallenge> userChallenges = userChallengeRepository.findByUserId(userId);
        return challenges.stream()
                .map(ch -> ChallengeDTO.from(ch, userChallenges))
                .collect(Collectors.toList());
    }

    public void joinChallenge(String userId, String challengeId) {
        if (!userChallengeRepository.existsByUserIdAndChallengeId(userId, challengeId)) {
            UserChallenge uc = new UserChallenge(userId, challengeId, 0, false);
            userChallengeRepository.save(uc);
        }
    }

    public ChallengeDTO getProgress(String userId, String challengeId) {
        UserChallenge uc = userChallengeRepository.findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Not participating in this challenge"));
        Challenge ch = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        return ChallengeDTO.from(ch, uc);
    }

    public void completeChallenge(String userId, String challengeId) {
        UserChallenge uc = userChallengeRepository.findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Not participating in this challenge"));
        uc.setCompleted(true);
        userChallengeRepository.save(uc);
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
}

