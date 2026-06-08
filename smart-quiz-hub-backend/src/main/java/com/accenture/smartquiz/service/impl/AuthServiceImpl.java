package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.config.LoginRateLimiter;
import com.accenture.smartquiz.dto.request.LoginRequest;
import com.accenture.smartquiz.dto.response.AuthResponse;
import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.repository.UserRepository;
import com.accenture.smartquiz.security.JwtTokenProvider;
import com.accenture.smartquiz.security.SmartQuizUserDetails;
import com.accenture.smartquiz.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final LoginRateLimiter rateLimiter;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        rateLimiter.checkAllowed(request.getEnterpriseId());

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEnterpriseId(), request.getPassword())
            );

            rateLimiter.reset(request.getEnterpriseId());

            SmartQuizUserDetails userDetails = (SmartQuizUserDetails) auth.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);

            User user = userRepository.findByEnterpriseId(userDetails.getEnterpriseId()).orElseThrow();

            log.info("Successful login for user ID: {}", user.getId());

            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .enterpriseId(user.getEnterpriseId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .expiresIn(expirationMs / 1000)
                    .build();

        } catch (BadCredentialsException ex) {
            rateLimiter.recordFailure(request.getEnterpriseId());
            log.warn("Failed login attempt (invalid credentials)");
            throw ex;
        }
    }
}
