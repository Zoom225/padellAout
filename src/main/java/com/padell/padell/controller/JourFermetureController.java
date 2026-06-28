package com.padell.padell.controller;

import com.padell.padell.dto.request.JourFermetureRequest;
import com.padell.padell.dto.response.JourFermetureResponse;
import com.padell.padell.entity.Administrateur;
import com.padell.padell.entity.JourFermeture;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.enums.TypeAdministrateur;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.JourFermetureRepository;
import com.padell.padell.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jours-fermeture")
@RequiredArgsConstructor
@Tag(name = "Jours de fermeture", description = "Endpoints de gestion des fermetures globales ou propres à un site.")
public class JourFermetureController {

    private final JourFermetureRepository jourFermetureRepository;
    private final SiteService siteService;
    private final AdministrateurRepository administrateurRepository;

    @Operation(
            summary = "Lister les jours de fermeture visibles",
            description = "Retourne les fermetures visibles pour l'administrateur connecté. " +
                    "Un admin GLOBAL voit tout ; un admin SITE voit les fermetures globales et celles de son site.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @GetMapping
    public ResponseEntity<List<JourFermetureResponse>> getAll() {
        Administrateur admin = getAuthenticatedAdmin();
        return ResponseEntity.ok(
                jourFermetureRepository.findAll().stream()
                        .filter(jour -> canAccessJour(admin, jour))
                        .map(this::toResponse)
                        .toList()
        );
    }

    @Operation(
            summary = "Lister les fermetures globales",
            description = "Retourne les fermetures qui bloquent tous les sites. Accessible uniquement aux administrateurs.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @GetMapping("/global")
    public ResponseEntity<List<JourFermetureResponse>> getGlobal() {
        return ResponseEntity.ok(
                jourFermetureRepository.findByGlobalTrue().stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @Operation(
            summary = "Lister les fermetures d'un site",
            description = "Retourne les fermetures propres à un site. " +
                    "Accessible à un admin GLOBAL ou à un admin SITE dans son périmètre.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @GetMapping("/site/{siteId}")
    public ResponseEntity<List<JourFermetureResponse>> getBySite(
            @Parameter(description = "ID du site", required = true)
            @PathVariable Long siteId) {
        Administrateur admin = getAuthenticatedAdmin();
        validateSiteAccess(admin, siteId);
        return ResponseEntity.ok(
                jourFermetureRepository.findBySiteId(siteId).stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    @Operation(
            summary = "Créer un jour de fermeture",
            description = "Crée une fermeture globale ou une fermeture propre à un site. " +
                    "Seul un admin GLOBAL peut créer une fermeture globale. " +
                    "Un admin SITE ne peut créer une fermeture que sur son propre site.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @PostMapping
    public ResponseEntity<JourFermetureResponse> create(@Valid @RequestBody JourFermetureRequest request) {
        Administrateur admin = getAuthenticatedAdmin();

        if (Boolean.TRUE.equals(request.getGlobal())) {
            if (admin.getTypeAdministrateur() != TypeAdministrateur.GLOBAL) {
                throw new BusinessException("Seul un admin GLOBAL peut créer une fermeture globale.");
            }
        } else if (request.getSiteId() == null) {
            throw new BusinessException("Un site est obligatoire pour une fermeture non globale.");
        } else {
            validateSiteAccess(admin, request.getSiteId());
        }

        Site site = Boolean.TRUE.equals(request.getGlobal()) ? null : siteService.getById(request.getSiteId());
        JourFermeture jour = JourFermeture.builder()
                .date(request.getDate())
                .raison(request.getRaison())
                .global(Boolean.TRUE.equals(request.getGlobal()))
                .site(site)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(jourFermetureRepository.save(jour)));
    }

    @Operation(
            summary = "Supprimer un jour de fermeture",
            description = "Supprime une fermeture. " +
                    "Seul un admin GLOBAL peut supprimer une fermeture globale. " +
                    "Un admin SITE ne peut supprimer que les fermetures de son site.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID du jour de fermeture", required = true)
            @PathVariable Long id) {
        Administrateur admin = getAuthenticatedAdmin();
        JourFermeture jour = jourFermetureRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Jour de fermeture introuvable."));

        if (Boolean.TRUE.equals(jour.getGlobal()) && admin.getTypeAdministrateur() != TypeAdministrateur.GLOBAL) {
            throw new BusinessException("Seul un admin GLOBAL peut supprimer une fermeture globale.");
        }
        if (jour.getSite() != null) {
            validateSiteAccess(admin, jour.getSite().getId());
        }

        jourFermetureRepository.delete(jour);
        return ResponseEntity.noContent().build();
    }

    private Administrateur getAuthenticatedAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new BusinessException("Authentification administrateur requise.");
        }

        return administrateurRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BusinessException("Administrateur introuvable."));
    }

    private boolean canAccessJour(Administrateur admin, JourFermeture jour) {
        return admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL
                || Boolean.TRUE.equals(jour.getGlobal())
                || (jour.getSite() != null && admin.getSite() != null && jour.getSite().getId().equals(admin.getSite().getId()));
    }

    private void validateSiteAccess(Administrateur admin, Long siteId) {
        if (admin.getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
            return;
        }
        if (admin.getSite() == null || !admin.getSite().getId().equals(siteId)) {
            throw new BusinessException("Un admin SITE ne peut agir que sur son propre site.");
        }
    }

    private JourFermetureResponse toResponse(JourFermeture jour) {
        return new JourFermetureResponse(
                jour.getId(),
                jour.getDate(),
                jour.getRaison(),
                jour.getGlobal(),
                jour.getSite() != null ? jour.getSite().getId() : null,
                jour.getSite() != null ? jour.getSite().getNom() : null
        );
    }
}
