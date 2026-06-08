package com.accenture.smartquiz.service.impl;

import com.accenture.smartquiz.dto.response.SmeUserResponse;
import com.accenture.smartquiz.dto.response.StackSummaryResponse;
import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.entity.enums.McqStatus;
import com.accenture.smartquiz.entity.enums.UserRole;
import com.accenture.smartquiz.repository.McqQuestionRepository;
import com.accenture.smartquiz.repository.UserRepository;
import com.accenture.smartquiz.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepo;
    private final McqQuestionRepository mcqRepo;

    @Override
    @Transactional(readOnly = true)
    public List<SmeUserResponse> getAllSmes() {
        return userRepo.findByRoleAndActiveTrue(UserRole.SME).stream()
                .map(this::toSmeResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SmeUserResponse> getSmesByStack(Long stackId) {
        List<User> smes = userRepo.findSmesByStackId(stackId);
        List<User> admins = userRepo.findByRoleAndActiveTrue(UserRole.ADMIN);
        return java.util.stream.Stream.concat(smes.stream(), admins.stream())
                .distinct()
                .map(this::toSmeResponse)
                .toList();
    }

    private SmeUserResponse toSmeResponse(User user) {
        List<StackSummaryResponse> stacks = user.getStackMappings().stream()
                .map(sm -> StackSummaryResponse.builder()
                        .id(sm.getStack().getId())
                        .stackName(sm.getStack().getStackName())
                        .build())
                .toList();

        return SmeUserResponse.builder()
                .id(user.getId())
                .enterpriseId(user.getEnterpriseId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .active(user.isActive())
                .stacks(stacks)
                .totalQuestions(mcqRepo.countByCreatorId(user.getId()))
                .approvedQuestions(mcqRepo.countByCreatorIdAndStatus(user.getId(), McqStatus.APPROVED))
                .build();
    }

}
