package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.config.LoginRateLimiter;
import com.accenture.smartquiz.dto.request.ChangePasswordRequest;
import com.accenture.smartquiz.dto.request.LoginRequest;
import com.accenture.smartquiz.dto.request.RefreshRequest;
import com.accenture.smartquiz.dto.response.AuthResponse;
import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.exception.ResourceNotFoundException;
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
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        rateLimiter.checkAllowed(request.enterpriseId());

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.enterpriseId(), request.password())
            );

            rateLimiter.reset(request.enterpriseId());

            SmartQuizUserDetails userDetails = (SmartQuizUserDetails) auth.getPrincipal();

            User user = userRepository.findByEnterpriseId(userDetails.getEnterpriseId()).orElseThrow();

            log.info("Successful login for user ID: {}", user.getId());

            return buildAuthResponse(userDetails, user);

        } catch (BadCredentialsException ex) {
            rateLimiter.recordFailure(request.enterpriseId());
            log.warn("Failed login attempt (invalid credentials)");
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshRequest request) {
        String enterpriseId = jwtTokenProvider.getEnterpriseIdFromRefreshToken(request.refreshToken());
        if (enterpriseId == null) {
            // Invalid / expired / non-refresh token — handled as a 401 by the global handler.
            throw new BadCredentialsException("Invalid refresh token");
        }

        User user = userRepository.findByEnterpriseId(enterpriseId)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!user.isActive()) {
            log.warn("Refresh rejected for disabled user ID: {}", user.getId());
            throw new BadCredentialsException("Invalid refresh token");
        }

        SmartQuizUserDetails userDetails = new SmartQuizUserDetails(user);
        log.info("Issued new access token via refresh for user ID: {}", user.getId());

        return buildAuthResponse(userDetails, user);
    }

    private AuthResponse buildAuthResponse(SmartQuizUserDetails userDetails, User user) {
        String token = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .enterpriseId(user.getEnterpriseId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .expiresIn(expirationMs / 1000)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request, SmartQuizUserDetails currentUser) {
        User user = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", currentUser.getUserId()));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            log.warn("Failed password change for user ID {} (current password mismatch)", user.getId());
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Password changed for user ID: {}", user.getId());
    }
}
