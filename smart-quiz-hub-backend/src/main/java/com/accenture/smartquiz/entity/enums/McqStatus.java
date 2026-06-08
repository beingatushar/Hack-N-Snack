package com.accenture.smartquiz.entity.enums;

import java.util.Set;

public enum McqStatus {

    DRAFT {
        @Override
        public Set<McqStatus> allowedTransitions() {
            return Set.of(READY_FOR_REVIEW);
        }
    },
    READY_FOR_REVIEW {
        @Override
        public Set<McqStatus> allowedTransitions() {
            return Set.of(UNDER_REVIEW, DRAFT);
        }
    },
    UNDER_REVIEW {
        @Override
        public Set<McqStatus> allowedTransitions() {
            return Set.of(APPROVED, REJECTED);
        }
    },
    APPROVED {
        @Override
        public Set<McqStatus> allowedTransitions() {
            return Set.of();
        }
    },
    REJECTED {
        @Override
        public Set<McqStatus> allowedTransitions() {
            return Set.of(READY_FOR_REVIEW);
        }
    };

    public abstract Set<McqStatus> allowedTransitions();

    public boolean canTransitionTo(McqStatus target) {
        return allowedTransitions().contains(target);
    }
}
