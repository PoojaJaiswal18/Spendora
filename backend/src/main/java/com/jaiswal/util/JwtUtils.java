package com.jaiswal.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Component
public class JwtUtils {

    @Value("${app.jwt.secret:mySecretKeyThatIsAtLeast32CharactersLongForHS512}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400}") // 24 hours in seconds
    private int jwtExpirationInSeconds;

    @Value("${app.jwt.refresh-expiration:604800}") // 7 days in seconds
    private int refreshExpirationInSeconds;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        return createToken(claims, userDetails.getUsername(), jwtExpirationInSeconds);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return createToken(claims, userDetails.getUsername(), refreshExpirationInSeconds);
    }

    private String createToken(Map<String, Object> claims, String subject, int expirationInSeconds) {
        Instant now = Instant.now();
        Instant expiration = now.plus(expirationInSeconds, ChronoUnit.SECONDS);

        return Jwts.builder()
                .claims(claims)  // Using claims() instead of setClaims()
                .subject(subject)  // Using subject() instead of setSubject()
                .issuedAt(Date.from(now))  // Using issuedAt() instead of setIssuedAt()
                .expiration(Date.from(expiration))  // Using expiration() instead of setExpiration()
                .signWith(getSigningKey())  // Simplified signWith() method
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    // Method that SecurityConfig expects
    public String getUserNameFromJwtToken(String token) {
        return getUsernameFromToken(token);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parser()  // Using parser() instead of parserBuilder()
                    .verifyWith(getSigningKey())  // Using verifyWith() instead of setSigningKey()
                    .build()
                    .parseSignedClaims(token)  // Using parseSignedClaims() instead of parseClaimsJws()
                    .getPayload();  // Using getPayload() instead of getBody()
        } catch (JwtException e) {
            log.error("Error parsing JWT token", e);
            throw e;
        }
    }

    public Boolean isTokenExpired(String token) {
        try {
            final Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = getUsernameFromToken(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException e) {
            log.error("JWT validation failed", e);
            return false;
        }
    }

    public Boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            log.error("JWT validation failed", e);
            return false;
        }
    }

    // Method that SecurityConfig expects
    public Boolean validateJwtToken(String token) {
        return validateToken(token);
    }

    public long getExpirationTime() {
        return jwtExpirationInSeconds * 1000L; // Convert to milliseconds
    }
}
