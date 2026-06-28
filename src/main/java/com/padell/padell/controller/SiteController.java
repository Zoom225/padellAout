package com.padell.padell.controller;

import com.padelPlay.dto.request.SiteRequest;
import com.padelPlay.dto.response.SiteResponse;
import com.padelPlay.entity.Site;
import com.padelPlay.mapper.SiteMapper;
import com.padelPlay.service.SiteService;
import com.padelPlay.service.impl.AdminAuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Tag(name = "Sites", description = "Endpoints de gestion des sites de padel.")
public class SiteController {

    private final SiteService siteService;
    private final SiteMapper siteMapper;
    private final AdminAuthorizationService adminAuthorizationService;

    @Operation(
            summary = "Créer un site",
            description = "Crée un nouveau site de padel avec ses horaires, sa durée de match et sa durée de pause. " +
                    "Accessible uniquement à un admin GLOBAL.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Site créé",
                    content = @Content(schema = @Schema(implementation = SiteResponse.class))),
            @ApiResponse(responseCode = "400", description = "Requête invalide ou erreur de validation",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<SiteResponse> create(@Valid @RequestBody SiteRequest request) {
        adminAuthorizationService.requireGlobalAdmin();
        Site site = siteMapper.toEntity(request);
        Site saved = siteService.create(site);
        return ResponseEntity.status(HttpStatus.CREATED).body(siteMapper.toResponse(saved));
    }

    @Operation(
            summary = "Lister les sites",
            description = "Retourne la liste des sites de padel. Endpoint public."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des sites retournée",
                    content = @Content(schema = @Schema(implementation = SiteResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<SiteResponse>> getAll() {
        List<SiteResponse> sites = siteService.getAll()
                .stream()
                .map(siteMapper::toResponse)
                .toList();
        return ResponseEntity.ok(sites);
    }

    @Operation(
            summary = "Consulter un site",
            description = "Retourne un site par son ID. Endpoint public."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Site trouvé",
                    content = @Content(schema = @Schema(implementation = SiteResponse.class))),
            @ApiResponse(responseCode = "404", description = "Site introuvable",
                    content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<SiteResponse> getById(
            @Parameter(description = "ID du site", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(siteMapper.toResponse(siteService.getById(id)));
    }

    @Operation(
            summary = "Modifier un site",
            description = "Modifie un site existant. Accessible uniquement à un admin GLOBAL.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Site modifié",
                    content = @Content(schema = @Schema(implementation = SiteResponse.class))),
            @ApiResponse(responseCode = "400", description = "Requête invalide ou erreur de validation",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Site introuvable",
                    content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<SiteResponse> update(
            @Parameter(description = "ID du site à modifier", required = true)
            @PathVariable Long id,
            @Valid @RequestBody SiteRequest request) {
        adminAuthorizationService.requireGlobalAdmin();
        Site site = siteMapper.toEntity(request);
        Site updated = siteService.update(id, site);
        return ResponseEntity.ok(siteMapper.toResponse(updated));
    }

    @Operation(
            summary = "Supprimer un site",
            description = "Supprime définitivement un site et ses données associées. Accessible uniquement à un admin GLOBAL.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Site supprimé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Site introuvable",
                    content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID du site à supprimer", required = true)
            @PathVariable Long id) {
        adminAuthorizationService.requireGlobalAdmin();
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
