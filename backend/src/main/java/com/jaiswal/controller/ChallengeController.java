package com.jaiswal.controller;

import com.jaiswal.model.dto.ChallengeDTO;
import com.jaiswal.service.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    @Autowired
    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeDTO>> getAllChallenges(@RequestParam String userId) {
        return ResponseEntity.ok(challengeService.getAllChallenges(userId));
    }

    @PostMapping("/join")
    public ResponseEntity<Void> joinChallenge(@RequestParam String userId, @RequestParam String challengeId) {
        challengeService.joinChallenge(userId, challengeId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/progress")
    public ResponseEntity<ChallengeDTO> getProgress(@RequestParam String userId, @RequestParam String challengeId) {
        return ResponseEntity.ok(challengeService.getProgress(userId, challengeId));
    }

    @PostMapping("/complete")
    public ResponseEntity<Void> completeChallenge(@RequestParam String userId, @RequestParam String challengeId) {
        challengeService.completeChallenge(userId, challengeId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<ChallengeDTO>> getLeaderboard(@RequestParam String challengeId) {
        return ResponseEntity.ok(challengeService.getLeaderboard(challengeId));
    }
}

