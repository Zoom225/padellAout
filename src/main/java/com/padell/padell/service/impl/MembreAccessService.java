package com.padell.padell.service.impl;

import com.padell.padell.entity.Membre;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.repository.MembreRepository;
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
    private final MembreRepository membreRepository;

    public boolean canCreate(Long siteId) {
        return adminAuthorizationService.canAccessMembreSite(siteId);
    }

    public void assertCanCreate(Long siteId) {
        adminAuthorizationService.checkMembreAccess(siteId);
    }

    public boolean canManageById(Long membreId) {
        Membre membre = membreRepository.findById(membreId).orElse(null);
        return membre == null || adminAuthorizationService.canAccessMembre(membre);
    }

    public void assertCanManage(Membre membre) {
        adminAuthorizationService.checkMembreAccess(membre);
    }

    public boolean canReadById(Long membreId) {
        Membre membre = membreRepository.findById(membreId).orElse(null);
        return membre == null || canRead(membre);
    }

    public boolean canReadByMatricule(String matricule) {
        Membre membre = membreRepository.findByMatriculeIgnoreCase(matricule).orElse(null);
        return membre == null || canRead(membre);
    }

    public List<Membre> filterMembres(List<Membre> membres) {
        return adminAuthorizationService.filterMembres(membres);
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

    private boolean canRead(Membre membre) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean admin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (admin) {
            return adminAuthorizationService.canAccessMembre(membre);
        }

        return currentMemberService.isCurrentMemberId(membre.getId());
    }
}
