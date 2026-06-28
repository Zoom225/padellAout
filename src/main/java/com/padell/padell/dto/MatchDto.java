package com.padell.padell.dto;

import com.padell.padell.entity.enums.StatutMatch;
import com.padell.padell.entity.enums.TypeMatch;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record MatchDto(
        Long id,
        Long terrainId,
        String terrainNom,
        String siteNom,
        Long organisateurId,
        String organisateurNom,
        LocalDate date,
        LocalTime heureDebut,
        LocalTime heureFin,
        TypeMatch typeMatch,
        StatutMatch statut,
        Integer nbJoueursActuels,
        Double prixParJoueur,
        LocalDateTime dateConversionPublic
) {}