package com.padell.padell.service.impl;

import com.padell.padell.entity.Membre;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MembreAccessService {

    private final AdminAuthorizationService adminAuthorizationService;
    private final CurrentMemberService currentMemberService;

    public void assertCanCreate(Long siteId) {
        adminAuthorizationService.checkMembreAccess(siteId);
    }

    public void assertCanManage(Membre membre) {
        adminAuthorizationService.checkMembreAccess(membre);
    }

    public void assertCanRead(Membre membre) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean admin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (admin) {
            adminAuthorizationService.checkMembreAccess(membre);
            return;
        }

        currentMemberService.requireCurrentMember(membre.getId());
    }

    public List<Membre> filterMembres(List<Membre> membres) {
        return adminAuthorizationService.filterMembres(membres);
    }
}
