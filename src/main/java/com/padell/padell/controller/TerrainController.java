package com.padell.padell.controller;

import com.padelPlay.dto.request.TerrainRequest;
import com.padelPlay.dto.response.TerrainResponse;
import com.padelPlay.entity.Terrain;
import com.padelPlay.mapper.TerrainMapper;
import com.padelPlay.service.TerrainService;
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
@RequestMapping("/api/terrains")
@RequiredArgsConstructor
@Tag(name = "Terrains", description = "Endpoints de gestion des terrains de padel.")
public class TerrainController {

    private final TerrainService terrainService;
    private final TerrainMapper terrainMapper;
    private final AdminAuthorizationService adminAuthorizationService;

    @Operation(
            summary = "Créer un terrain",
            description = "Crée un terrain et le rattache à un site existant. " +
                    "Accessible à un admin GLOBAL ou à un admin SITE dans son périmètre.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Terrain créé",
                    content = @Content(schema = @Schema(implementation = TerrainResponse.class))),
            @ApiResponse(responseCode = "400", description = "Requête invalide ou erreur de validation",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Site introuvable",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<TerrainResponse> create(@Valid @RequestBody TerrainRequest request) {
        adminAuthorizationService.checkSiteAccess(request.getSiteId());
        Terrain terrain = terrainMapper.toEntity(request);
        Terrain saved = terrainService.create(terrain, request.getSiteId());
        return ResponseEntity.status(HttpStatus.CREATED).body(terrainMapper.toResponse(saved));
    }

    @Operation(
            summary = "Lister les terrains",
            description = "Retourne la liste des terrains. Endpoint public."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des terrains retournée",
                    content = @Content(schema = @Schema(implementation = TerrainResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<TerrainResponse>> getAll() {
        List<TerrainResponse> terrains = terrainService.getAll()
                .stream()
                .map(terrainMapper::toResponse)
                .toList();
        return ResponseEntity.ok(terrains);
    }

    @Operation(
            summary = "Consulter un terrain",
            description = "Retourne un terrain par son ID. Endpoint public."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Terrain trouvé",
                    content = @Content(schema = @Schema(implementation = TerrainResponse.class))),
            @ApiResponse(responseCode = "404", description = "Terrain introuvable",
                    content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<TerrainResponse> getById(
            @Parameter(description = "ID du terrain", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(terrainMapper.toResponse(terrainService.getById(id)));
    }

    @Operation(
            summary = "Lister les terrains d'un site",
            description = "Retourne les terrains d'un site donné. Endpoint public."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Terrains du site retournés",
                    content = @Content(schema = @Schema(implementation = TerrainResponse.class))),
            @ApiResponse(responseCode = "404", description = "Site introuvable",
                    content = @Content)
    })
    @GetMapping("/site/{siteId}")
    public ResponseEntity<List<TerrainResponse>> getBySiteId(
            @Parameter(description = "ID du site", required = true)
            @PathVariable Long siteId) {
        List<TerrainResponse> terrains = terrainService.getBySiteId(siteId)
                .stream()
                .map(terrainMapper::toResponse)
                .toList();
        return ResponseEntity.ok(terrains);
    }

    @Operation(
            summary = "Modifier un terrain",
            description = "Modifie un terrain existant. " +
                    "Accessible à un admin GLOBAL ou à un admin SITE dans son périmètre.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Terrain modifié",
                    content = @Content(schema = @Schema(implementation = TerrainResponse.class))),
            @ApiResponse(responseCode = "400", description = "Requête invalide ou erreur de validation",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Terrain introuvable",
                    content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<TerrainResponse> update(
            @Parameter(description = "ID du terrain à modifier", required = true)
            @PathVariable Long id,
            @Valid @RequestBody TerrainRequest request) {
        adminAuthorizationService.checkTerrainAccess(terrainService.getById(id));
        Terrain terrain = terrainMapper.toEntity(request);
        Terrain updated = terrainService.update(id, terrain);
        return ResponseEntity.ok(terrainMapper.toResponse(updated));
    }

    @Operation(
            summary = "Supprimer un terrain",
            description = "Supprime définitivement un terrain et ses matchs associés. " +
                    "Accessible à un admin GLOBAL ou à un admin SITE dans son périmètre.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Terrain supprimé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Terrain introuvable",
                    content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID du terrain à supprimer", required = true)
            @PathVariable Long id) {
        adminAuthorizationService.checkTerrainAccess(terrainService.getById(id));
        terrainService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
