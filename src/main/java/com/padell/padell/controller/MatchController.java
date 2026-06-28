package com.padell.padell.controller;

import com.padelPlay.dto.request.MatchRequest;
import com.padelPlay.entity.Membre;
import com.padelPlay.match.dto.CreateMatchRequest;
import com.padelPlay.match.dto.MatchDto;
import com.padelPlay.service.MatchService;
import com.padelPlay.service.impl.AdminAuthorizationService;
import com.padelPlay.service.impl.CurrentMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Matchs", description = "Endpoints de gestion des matchs de padel.")
public class MatchController {

    private final MatchService matchService;
    private final AdminAuthorizationService adminAuthorizationService;
    private final CurrentMemberService currentMemberService;

    @Operation(
            summary = "Créer un match",
            description = "Crée un match PUBLIC ou PRIVÉ pour le membre connecté. " +
                    "Les limites de réservation GLOBAL, SITE et LIBRE s'appliquent à la création du match. " +
                    "Accessible uniquement à un membre authentifié.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @PostMapping
    public ResponseEntity<MatchDto> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        log.info("Requête de création de match reçue de l'utilisateur '{}' pour le terrain ID {}", username, request.terrainId());

        if (username == null || "anonymousUser".equals(username)) {
            log.warn("Tentative de création de match par un utilisateur non authentifié.");
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        MatchDto createdMatch = matchService.createMatch(request, username);
        return new ResponseEntity<>(createdMatch, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Lister tous les matchs",
            description = "Retourne les matchs visibles pour l'administrateur connecté. " +
                    "Un admin GLOBAL voit tous les matchs ; un admin SITE voit uniquement ceux de son site.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @GetMapping
    public ResponseEntity<List<MatchDto>> getAllMatches() {
        return ResponseEntity.ok(adminAuthorizationService.filterMatchDtos(matchService.findAllMatches()));
    }

    @Operation(
            summary = "Lister les matchs publics disponibles",
            description = "Retourne les matchs PUBLICS planifiés et encore disponibles. Endpoint public."
    )
    @GetMapping("/public")
    public ResponseEntity<List<MatchDto>> getPublicMatches() {
        return ResponseEntity.ok(matchService.getPublicAvailableMatches());
    }

    @Operation(
            summary = "Consulter un match",
            description = "Retourne le détail d'un match. Accessible aux membres et aux administrateurs authentifiés.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @GetMapping("/{id}")
    public ResponseEntity<MatchDto> getById(
            @Parameter(description = "ID du match", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatchDtoById(id));
    }

    @Operation(
            summary = "Lister les matchs organisés par un membre",
            description = "Retourne les matchs organisés par le membre connecté. " +
                    "Le membre connecté doit correspondre à l'ID fourni.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @GetMapping("/organisateur/{organisateurId}")
    public ResponseEntity<List<MatchDto>> getByOrganisateur(
            @Parameter(description = "ID de l'organisateur", required = true)
            @PathVariable Long organisateurId) {
        currentMemberService.requireCurrentMember(organisateurId);
        return ResponseEntity.ok(matchService.findByOrganisateur(organisateurId));
    }

    @Operation(
            summary = "Lister les matchs d'un site",
            description = "Retourne les matchs d'un site. Accessible à un admin GLOBAL ou à un admin SITE dans son périmètre.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @GetMapping("/site/{siteId}")
    public ResponseEntity<List<MatchDto>> getBySite(
            @Parameter(description = "ID du site", required = true)
            @PathVariable Long siteId) {
        adminAuthorizationService.checkSiteAccess(siteId);
        return ResponseEntity.ok(matchService.findBySite(siteId));
    }

    @Operation(
            summary = "Modifier un match",
            description = "Modifie un match existant. Accessible uniquement au membre organisateur.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @PutMapping("/{id}")
    public ResponseEntity<MatchDto> updateMatch(
            @Parameter(description = "ID du match", required = true)
            @PathVariable Long id,
            @Valid @RequestBody MatchRequest request) {
        return ResponseEntity.ok(matchService.updateMatch(id, request));
    }

    @Operation(
            summary = "Annuler un match",
            description = "Annule un match existant. Accessible uniquement au membre organisateur.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelMatch(
            @Parameter(description = "ID du match", required = true)
            @PathVariable Long id,
            @RequestParam(required = false) Long requesterId) {
        Membre currentMember = currentMemberService.currentMember();
        if (requesterId != null && !currentMember.getId().equals(requesterId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        matchService.cancelMatch(id, currentMember.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Convertir un match privé en public",
            description = "Convertit un match PRIVÉ en PUBLIC et applique une pénalité à l'organisateur. " +
                    "Accessible à un admin GLOBAL ou à un admin SITE dans son périmètre.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @PatchMapping("/{id}/convert-public")
    public ResponseEntity<Void> convertToPublic(
            @Parameter(description = "ID du match", required = true)
            @PathVariable Long id) {
        adminAuthorizationService.checkMatchAccess(matchService.getById(id));
        matchService.convertToPublic(id);
        return ResponseEntity.noContent().build();
    }
}
