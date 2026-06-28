package com.padell.padell.mapper;

import com.padelPlay.entity.Match;
import com.padelPlay.entity.Membre;
import com.padelPlay.entity.Site;
import com.padelPlay.entity.Terrain;
import com.padelPlay.match.dto.MatchDto;
import org.springframework.stereotype.Service;

@Service
public class MatchMapper {

    public MatchDto toMatchDto(Match match) {
        if (match == null) {
            return null;
        }

        Terrain terrain = match.getTerrain();
        Membre organisateur = match.getOrganisateur();
        Site site = (terrain != null) ? terrain.getSite() : null;

        Long terrainId = (terrain != null) ? terrain.getId() : null;
        String terrainNom = (terrain != null) ? terrain.getNom() : null;
        String siteNom = (site != null) ? site.getNom() : null;
        Long organisateurId = (organisateur != null) ? organisateur.getId() : null;
        String organisateurNom = (organisateur != null && organisateur.getPrenom() != null && organisateur.getNom() != null)
                ? organisateur.getPrenom() + " " + organisateur.getNom()
                : null;

        return new MatchDto(
                match.getId(),
                terrainId,
                terrainNom,
                siteNom,
                organisateurId,
                organisateurNom,
                match.getDateDebut() != null ? match.getDateDebut().toLocalDate() : null,
                match.getDateDebut() != null ? match.getDateDebut().toLocalTime() : null,
                match.getDateFin() != null ? match.getDateFin().toLocalTime() : null,
                match.getTypeMatch(),
                match.getStatut(),
                match.getNbJoueursActuels(),
                match.getPrixParJoueur(),
                match.getDateConversionPublic()
        );
    }
}