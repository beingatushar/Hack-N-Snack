package com.accenture.smartquiz.security;

import com.accenture.smartquiz.entity.User;
import com.accenture.smartquiz.entity.enums.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class SmartQuizUserDetails implements UserDetails {

    private final Long userId;
    private final String enterpriseId;
    private final String fullName;
    private final String password;
    private final UserRole role;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public SmartQuizUserDetails(User user) {
        this.userId = user.getId();
        this.enterpriseId = user.getEnterpriseId();
        this.fullName = user.getFullName();
        this.password = user.getPassword();
        this.role = user.getRole();
        this.active = user.isActive();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getUsername() {
        return enterpriseId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
