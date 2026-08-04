package com.padell.padell.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtConfig {

    @Value("${jwt.secret:default-jwt-secret-default-jwt-secret-default-jwt-secret-default-jwt-secret-123456}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // génère un token JWT pour un admin
    public String generateToken(String email, String role) {
        return generateToken(email, role, null);
    }

    // génère un token JWT avec un type de principal explicite
    public String generateToken(String subject, String role, String principalType) {
        var builder = Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration));

        if (StringUtils.hasText(principalType)) {
            builder.claim("principalType", principalType);
        }

        return builder.signWith(getSigningKey()).compact();
    }

    // extrait l'email depuis le token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // extrait le rôle depuis le token
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // extrait le type de principal depuis le token
    public String extractPrincipalType(String token) {
        return extractClaims(token).get("principalType", String.class);
    }

    // vérifie si le token est valide
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("Invalid JWT token : {}", e.getMessage());
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
