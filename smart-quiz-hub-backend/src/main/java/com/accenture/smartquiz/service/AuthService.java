package com.accenture.smartquiz.service;

import com.accenture.smartquiz.dto.request.LoginRequest;
import com.accenture.smartquiz.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);
}
