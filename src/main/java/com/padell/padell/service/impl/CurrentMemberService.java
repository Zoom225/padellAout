package com.padell.padell.service.impl;

import com.padell.padell.entity.Membre;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentMemberService {

    private final MembreRepository membreRepository;

    public Membre currentMember() {
        // Règle métier: Vérifie si l'utilisateur est authentifié en tant que membre.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new BusinessException("Authentification membre requise.");
        }

        // Règle métier: Vérifie si le membre authentifié existe dans la base de données.
        return membreRepository.findByMatricule(authentication.getName())
                .orElseThrow(() -> new BusinessException("Membre connecté introuvable."));
    }

    public Long currentMemberId() {
        return currentMember().getId();
    }

    public void requireCurrentMember(Long membreId) {
        // Règle métier: Vérifie si le membre authentifié est bien le propriétaire de la ressource.
        if (!currentMemberId().equals(membreId)) {
            throw new BusinessException("Accès refusé : cette ressource appartient à un autre membre.");
        }
    }
}