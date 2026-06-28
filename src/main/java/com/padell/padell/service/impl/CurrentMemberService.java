package com.padell.padell.service.impl;

import com.padelPlay.entity.Membre;
import com.padelPlay.exception.BusinessException;
import com.padelPlay.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentMemberService {

    private final MembreRepository membreRepository;

    public Membre currentMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new BusinessException("Authentification membre requise.");
        }

        return membreRepository.findByMatricule(authentication.getName())
                .orElseThrow(() -> new BusinessException("Membre connecté introuvable."));
    }

    public Long currentMemberId() {
        return currentMember().getId();
    }

    public void requireCurrentMember(Long membreId) {
        if (!currentMemberId().equals(membreId)) {
            throw new BusinessException("Accès refusé : cette ressource appartient à un autre membre.");
        }
    }
}
