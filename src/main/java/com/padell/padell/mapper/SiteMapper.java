package com.padell.padell.mapper;

import com.padell.padell.dto.request.SiteRequest;
import com.padell.padell.dto.response.SiteResponse;
import com.padell.padell.entity.Site;
import org.springframework.stereotype.Component;

@Component
public class SiteMapper {

    public Site toEntity(SiteRequest request) {
        if (request == null) {
            return null;
        }
        return Site.builder()
                .nom(request.getNom())
                .adresse(request.getAdresse())
                .heureOuverture(request.getHeureOuverture())
                .heureFermeture(request.getHeureFermeture())
                .dureeMatchMinutes(request.getDureeMatchMinutes())
                .dureeEntreMatchMinutes(request.getDureeEntreMatchMinutes())
                .anneeCivile(request.getAnneeCivile())
                .build();
    }

    public SiteResponse toResponse(Site site) {
        if (site == null) {
            return null;
        }
        // Correction : Le builder gère déjà les champs null, mais cette approche est plus explicite
        // et montre la robustesse. Le simple fait d'utiliser le builder sur une entité
        // avec des champs null ne lèvera pas de NullPointerException.
        // L'erreur venait probablement d'une entité Site elle-même nulle dans la liste.
        // Ajouter cette vérification de nullité pour l'entité entière est la clé.
        return SiteResponse.builder()
                .id(site.getId())
                .nom(site.getNom())
                .adresse(site.getAdresse())
                .heureOuverture(site.getHeureOuverture())
                .heureFermeture(site.getHeureFermeture())
                .dureeMatchMinutes(site.getDureeMatchMinutes())
                .dureeEntreMatchMinutes(site.getDureeEntreMatchMinutes())
                .anneeCivile(site.getAnneeCivile())
                .build();
    }
}
