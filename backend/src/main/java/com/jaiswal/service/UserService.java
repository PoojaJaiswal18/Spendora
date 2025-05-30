package com.jaiswal.service;

import com.jaiswal.exception.ResourceNotFoundException;
import com.jaiswal.exception.ValidationException;
import com.jaiswal.model.document.User;
import com.jaiswal.model.dto.UserDTO;
import com.jaiswal.repository.UserRepository;
import com.jaiswal.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        return userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + usernameOrEmail));
    }

    @Cacheable(value = "users", key = "#userId")
    public UserDTO getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return convertToDTO(user);
    }

    @Cacheable(value = "users", key = "#username")
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return convertToDTO(user);
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO, String password) {
        validateUserCreation(userDTO);

        User user = User.builder()
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(password))
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .roles(userDTO.getRoles() != null ? userDTO.getRoles() : Set.of("USER"))
                .preferences(User.UserPreferences.builder()
                        .currency("USD")
                        .dateFormat("MM/dd/yyyy")
                        .timezone("UTC")
                        .emailNotifications(true)
                        .pushNotifications(true)
                        .theme("light")
                        .build())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created new user: {}", savedUser.getUsername());

        return convertToDTO(savedUser);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public UserDTO updateUser(String userId, UserDTO userDTO) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Update only non-null fields
        if (userDTO.getFirstName() != null) {
            existingUser.setFirstName(userDTO.getFirstName());
        }
        if (userDTO.getLastName() != null) {
            existingUser.setLastName(userDTO.getLastName());
        }
        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new ValidationException("Email already exists: " + userDTO.getEmail());
            }
            existingUser.setEmail(userDTO.getEmail());
        }
        if (userDTO.getProfileImageUrl() != null) {
            existingUser.setProfileImageUrl(userDTO.getProfileImageUrl());
        }

        User updatedUser = userRepository.save(existingUser);
        log.info("Updated user: {}", updatedUser.getUsername());

        return convertToDTO(updatedUser);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public void updateLastLogin(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
        log.info("Deleted user with id: {}", userId);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<UserDTO> getActiveUsers() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return userRepository.findActiveUsersSince(thirtyDaysAgo)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    private void validateUserCreation(UserDTO userDTO) {
        if (!ValidationUtils.isValidEmail(userDTO.getEmail())) {
            throw new ValidationException("Invalid email format: " + userDTO.getEmail());
        }

        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new ValidationException("Username already exists: " + userDTO.getUsername());
        }

        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ValidationException("Email already exists: " + userDTO.getEmail());
        }
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .roles(user.getRoles())
                .preferences(convertPreferencesToDTO(user.getPreferences()))
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private UserDTO.UserPreferencesDTO convertPreferencesToDTO(User.UserPreferences preferences) {
        if (preferences == null) return null;

        return UserDTO.UserPreferencesDTO.builder()
                .currency(preferences.getCurrency())
                .dateFormat(preferences.getDateFormat())
                .timezone(preferences.getTimezone())
                .emailNotifications(preferences.isEmailNotifications())
                .pushNotifications(preferences.isPushNotifications())
                .theme(preferences.getTheme())
                .build();
    }
}
