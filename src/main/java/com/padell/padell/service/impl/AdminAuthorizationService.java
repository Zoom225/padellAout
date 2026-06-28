package com.padell.padell.service.impl;

import com.padelPlay.entity.Administrateur;
import com.padelPlay.entity.Match;
import com.padelPlay.entity.Membre;
import com.padelPlay.entity.Terrain;
import com.padelPlay.entity.enums.TypeAdministrateur;
import com.padelPlay.exception.BusinessException;
import com.padelPlay.match.dto.MatchDto;
import com.padelPlay.repository.AdministrateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAuthorizationService {

    private final AdministrateurRepository administrateurRepository;

    public Administrateur currentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new BusinessException("Authentification administrateur requise.");
        }

        return administrateurRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BusinessException("Administrateur introuvable."));
    }

    public void requireGlobalAdmin() {
        if (currentAdmin().getTypeAdministrateur() != TypeAdministrateur.GLOBAL) {
            throw new BusinessException("Action réservée à un admin GLOBAL.");
        }
    }

    public void checkSiteAccess(Long siteId) {
        Administrateur admin = currentAdmin();
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return;
        }
        if (admin.getSite() == null || !admin.getSite().getId().equals(siteId)) {
            throw new BusinessException("Un admin SITE ne peut agir que sur son propre site.");
        }
    }

    public void checkTerrainAccess(Terrain terrain) {
        checkSiteAccess(terrain.getSite().getId());
    }

    public void checkMatchAccess(Match match) {
        checkSiteAccess(match.getTerrain().getSite().getId());
    }

    public void checkMembreAccess(Membre membre) {
        Administrateur admin = currentAdmin();
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return;
        }
        if (membre.getSite() == null || admin.getSite() == null || !membre.getSite().getId().equals(admin.getSite().getId())) {
            throw new BusinessException("Un admin SITE ne peut gérer que les membres de son site.");
        }
    }

    public List<Membre> filterMembres(List<Membre> membres) {
        Administrateur admin = currentAdmin();
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return membres;
        }
        Long siteId = admin.getSite() != null ? admin.getSite().getId() : null;
        return membres.stream()
                .filter(membre -> membre.getSite() != null && membre.getSite().getId().equals(siteId))
                .toList();
    }

    public List<Match> filterMatches(List<Match> matches) {
        Administrateur admin = currentAdmin();
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return matches;
        }
        Long siteId = admin.getSite() != null ? admin.getSite().getId() : null;
        return matches.stream()
                .filter(match -> match.getTerrain() != null
                        && match.getTerrain().getSite() != null
                        && match.getTerrain().getSite().getId().equals(siteId))
                .toList();
    }

    public List<MatchDto> filterMatchDtos(List<MatchDto> matches) {
        Administrateur admin = currentAdmin();
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return matches;
        }
        String siteNom = admin.getSite() != null ? admin.getSite().getNom() : null;
        return matches.stream()
                .filter(match -> match.siteNom() != null && match.siteNom().equals(siteNom))
                .toList();
    }
}
