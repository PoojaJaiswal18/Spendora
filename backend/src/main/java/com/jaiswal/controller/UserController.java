package com.jaiswal.controller;

import com.jaiswal.model.dto.UserDTO;
import com.jaiswal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.register(userDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.login(userDTO));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestParam String userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestParam String userId, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateProfile(userId, userDTO));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam String userId) {
        userService.logout(userId);
        return ResponseEntity.ok().build();
    }
}

