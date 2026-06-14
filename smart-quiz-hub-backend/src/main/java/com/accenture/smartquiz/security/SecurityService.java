package com.accenture.smartquiz.security;

import com.accenture.smartquiz.entity.enums.UserRole;
import com.accenture.smartquiz.repository.McqQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Method-security helper exposed to SpEL as {@code @securityService}.
 *
 * <p>Backs {@code @PreAuthorize("@securityService.isOwner(#id, principal)")} on write
 * endpoints (Story 1.1 — creator-only edit). Ownership is the declarative gate at the
 * controller boundary; finer-grained status rules (e.g. the terminal "rejected for life"
 * lock) remain enforced inside the service layer.
 */
@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final McqQuestionRepository mcqRepo;

    /**
     * @return {@code true} if the principal is the question's creator or an admin.
     *         Returns {@code true} for a non-existent question so the service layer can
     *         surface a clean 404 instead of this check masking it as a 403.
     */
    @Transactional(readOnly = true)
    public boolean isOwner(Long questionId, SmartQuizUserDetails principal) {
        if (principal == null) {
            return false;
        }
        return mcqRepo.findById(questionId)
                .map(q -> q.getCreator().getId().equals(principal.getUserId())
                        || principal.getRole() == UserRole.ADMIN)
                .orElse(true);
    }
}
