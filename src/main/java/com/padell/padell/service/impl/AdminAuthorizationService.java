package com.padell.padell.service.impl;

import com.padell.padell.entity.Administrateur;
import com.padell.padell.entity.Match;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Terrain;
import com.padell.padell.entity.enums.TypeAdministrateur;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.dto.response.MatchDto;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAuthorizationService {

    private final AdministrateurRepository administrateurRepository;
    private final MatchRepository matchRepository;

    public Administrateur currentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Regle metier : une action admin exige une authentification administrateur.
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new BusinessException("Authentification administrateur requise.");
        }

        return administrateurRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BusinessException("Administrateur introuvable."));
    }

    public void requireGlobalAdmin() {
        // Regle metier : certaines actions sont reservees a l'admin GLOBAL.
        if (currentAdmin().getTypeAdministrateur() != TypeAdministrateur.GLOBAL) {
            throw new BusinessException("Action réservée à un admin GLOBAL.");
        }
    }

    public void checkSiteAccess(Long siteId) {
        Administrateur admin = currentAdmin();
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return;
        }
        // Regle metier : un admin SITE ne peut agir que sur son propre site.
        if (admin.getSite() == null || !admin.getSite().getId().equals(siteId)) {
            throw new BusinessException("Un admin SITE ne peut agir que sur son propre site.");
        }
    }

    public void checkTerrainAccess(Terrain terrain) {
        checkSiteAccess(terrain.getSite().getId());
    }    public void checkMatchAccess(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BusinessException("Match introuvable avec l'ID : " + matchId));
        checkSiteAccess(match.getTerrain().getSite().getId());
    }

    public void checkMembreAccess(Membre membre) {
        Administrateur admin = currentAdmin();
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return;
        }
        // Regle metier : un admin SITE ne peut gerer que les membres de son site.
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
