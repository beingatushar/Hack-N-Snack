package com.accenture.smartquiz.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_REFRESH = "refresh";

    private final SecretKey secretKey;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs,
            @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateToken(SmartQuizUserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("role", userDetails.getRole().name())
                .claim("userId", userDetails.getUserId())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Mints a long-lived refresh token carrying the subject (enterpriseId) and a
     * {@code type=refresh} claim. It is used solely to obtain a new access token.
     */
    public String generateRefreshToken(SmartQuizUserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshExpirationMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim(CLAIM_TYPE, TYPE_REFRESH)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public String getEnterpriseIdFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Validates a refresh token (signature + expiry) and returns its subject
     * (enterpriseId). Rejects any token whose {@code type} claim is not
     * {@code refresh} — e.g. an access token replayed against the refresh endpoint.
     *
     * @return the enterpriseId if the token is a valid refresh token, otherwise {@code null}
     */
    public String getEnterpriseIdFromRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);
            if (!TYPE_REFRESH.equals(claims.get(CLAIM_TYPE, String.class))) {
                log.warn("Token presented to refresh endpoint is not a refresh token");
                return null;
            }
            return claims.getSubject();
        } catch (ExpiredJwtException e) {
            log.warn("Refresh token expired");
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported refresh token");
        } catch (MalformedJwtException e) {
            log.warn("Malformed refresh token");
        } catch (SecurityException e) {
            log.warn("Invalid refresh token signature");
        } catch (IllegalArgumentException e) {
            log.warn("Refresh token is empty");
        }
        return null;
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired");
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token");
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token");
        } catch (SecurityException e) {
            log.warn("Invalid JWT signature");
        } catch (IllegalArgumentException e) {
            log.warn("JWT token is empty");
        }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
