package com.accenture.smartquiz.service;

import com.accenture.smartquiz.dto.request.ChangePasswordRequest;
import com.accenture.smartquiz.dto.request.LoginRequest;
import com.accenture.smartquiz.dto.request.RefreshRequest;
import com.accenture.smartquiz.dto.response.AuthResponse;
import com.accenture.smartquiz.security.SmartQuizUserDetails;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshRequest request);

    void changePassword(ChangePasswordRequest request, SmartQuizUserDetails currentUser);
}
