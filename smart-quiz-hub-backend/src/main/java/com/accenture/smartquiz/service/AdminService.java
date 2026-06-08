package com.accenture.smartquiz.service;

import com.accenture.smartquiz.dto.response.SmeUserResponse;

import java.util.List;

public interface AdminService {

    List<SmeUserResponse> getAllSmes();

    List<SmeUserResponse> getSmesByStack(Long stackId);
}
