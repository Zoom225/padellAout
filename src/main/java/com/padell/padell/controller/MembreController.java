package com.padell.padell.controller;

import com.padell.padell.config.JwtConfig;
import com.padell.padell.dto.request.MembreRequest;
import com.padell.padell.dto.response.MembreResponse;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.enums.TypeAdministrateur;
import com.padell.padell.mapper.MembreMapper;
import com.padell.padell.service.MembreService;
import com.padell.padell.service.SiteService;
import com.padell.padell.service.impl.AdminAuthorizationService;
import com.padell.padell.service.impl.CurrentMemberService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membres")
@RequiredArgsConstructor
@Tag(name = "Membres", description = "Endpoints de gestion des membres de padel. " +
        "Les membres se connectent avec leur matricule via /api/membres/login.")
public class MembreController {

    private final MembreService membreService;
    private final SiteService siteService;
    private final MembreMapper membreMapper;
    private final JwtConfig jwtConfig;
    private final AdminAuthorizationService adminAuthorizationService;
    private final CurrentMemberService currentMemberService;

    @Operation(
            summary = "Créer un membre",
            description = "Crée un membre avec un matricule unique. " +
                    "Un membre SITE doit être rattaché à un site. " +
                    "Accessible uniquement aux administrateurs.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Membre créé",
                    content = @Content(schema = @Schema(implementation = MembreResponse.class))),
            @ApiResponse(responseCode = "400", description = "Requête invalide, format de matricule incorrect ou matricule déjà existant",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Site introuvable lorsque siteId est fourni",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<MembreResponse> create(@Valid @RequestBody MembreRequest request) {
        Membre membre = membreMapper.toEntity(request);

        if (request.getSiteId() != null) {
            Site site = siteService.getById(request.getSiteId());
            membre.setSite(site);
        }

        adminAuthorizationService.checkMembreAccess(membre);
        Membre saved = membreService.create(membre);
        return ResponseEntity.status(HttpStatus.CREATED).body(membreMapper.toResponse(saved));
    }

    @Operation(
            summary = "Lister les membres",
            description = "Retourne les membres visibles pour l'administrateur connecté.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des membres retournée",
                    content = @Content(schema = @Schema(implementation = MembreResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<MembreResponse>> getAll() {
        List<MembreResponse> membres = adminAuthorizationService.filterMembres(membreService.getAll())
                .stream()
                .map(membreMapper::toResponse)
                .toList();
        return ResponseEntity.ok(membres);
    }

    @Operation(
            summary = "Consulter un membre par ID",
            description = "Retourne un membre par son ID interne. " +
                    "Accessible au membre propriétaire de la donnée ou à un administrateur.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membre trouvé",
                    content = @Content(schema = @Schema(implementation = MembreResponse.class))),
            @ApiResponse(responseCode = "404", description = "Membre introuvable",
                    content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<MembreResponse> getById(
            @Parameter(description = "ID interne du membre", required = true)
            @PathVariable Long id) {
        Membre membre = membreService.getById(id);
        checkCurrentAccess(membre);
        return ResponseEntity.ok(membreMapper.toResponse(membre));
    }

    @Operation(
            summary = "Consulter un membre par matricule",
            description = "Retourne un membre à partir de son matricule. " +
                    "Accessible aux membres et aux administrateurs authentifiés.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membre trouvé",
                    content = @Content(schema = @Schema(implementation = MembreResponse.class))),
            @ApiResponse(responseCode = "404", description = "Membre introuvable avec ce matricule",
                    content = @Content)
    })
    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<MembreResponse> getByMatricule(
            @Parameter(description = "Matricule unique du membre", required = true)
            @PathVariable String matricule) {
        Membre membre = membreService.getByMatricule(matricule);
        return ResponseEntity.ok(membreMapper.toResponse(membre));
    }

    @Operation(
            summary = "Vérifier la pénalité active d'un membre",
            description = "Retourne true si le membre a une pénalité active. " +
                    "Pendant 7 jours, le membre ne peut plus créer ni rejoindre de match. " +
                    "Accessible au membre propriétaire de la donnée ou à un administrateur.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statut de pénalité retourné",
                    content = @Content(schema = @Schema(implementation = Boolean.class))),
            @ApiResponse(responseCode = "404", description = "Membre introuvable",
                    content = @Content)
    })
    @GetMapping("/{id}/penalty")
    public ResponseEntity<Boolean> hasActivePenalty(
            @Parameter(description = "ID du membre à vérifier", required = true)
            @PathVariable Long id) {
        try {
            checkCurrentAccess(membreService.getById(id));
            return ResponseEntity.ok(membreService.hasActivePenalty(id));
        } catch (com.padell.padell.exception.ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @Operation(
            summary = "Vérifier le solde dû d'un membre",
            description = "Retourne true si le membre a un solde dû. " +
                    "Un membre avec un solde dû ne peut pas créer de nouveau match tant que ce solde n'est pas réglé. " +
                    "Le solde est automatiquement ajouté au prochain paiement. " +
                    "Accessible au membre propriétaire de la donnée ou à un administrateur.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statut de solde retourné",
                    content = @Content(schema = @Schema(implementation = Boolean.class))),
            @ApiResponse(responseCode = "404", description = "Membre introuvable",
                    content = @Content)
    })
    @GetMapping("/{id}/balance")
    public ResponseEntity<Boolean> hasOutstandingBalance(
            @Parameter(description = "ID du membre à vérifier", required = true)
            @PathVariable Long id) {
        try {
            checkCurrentAccess(membreService.getById(id));
            return ResponseEntity.ok(membreService.hasOutstandingBalance(id));
        } catch (com.padell.padell.exception.ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @Operation(
            summary = "Modifier un membre",
            description = "Modifie les informations personnelles d'un membre existant. " +
                    "Accessible uniquement aux administrateurs.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membre modifié",
                    content = @Content(schema = @Schema(implementation = MembreResponse.class))),
            @ApiResponse(responseCode = "400", description = "Requête invalide ou erreur de validation",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé : token administrateur requis",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Membre introuvable",
                    content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<MembreResponse> update(
            @Parameter(description = "ID du membre à modifier", required = true)
            @PathVariable Long id,
            @Valid @RequestBody MembreRequest request) {
        adminAuthorizationService.checkMembreAccess(membreService.getById(id));
        Membre membre = membreMapper.toEntity(request);
        Membre updated = membreService.update(id, membre);
        return ResponseEntity.ok(membreMapper.toResponse(updated));
    }

    @Operation(
            summary = "Supprimer un membre",
            description = "Supprime définitivement un membre et ses données associées. " +
                    "Accessible uniquement aux administrateurs.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Membre supprimé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé : token administrateur requis",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Membre introuvable",
                    content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID du membre à supprimer", required = true)
            @PathVariable Long id) {
        adminAuthorizationService.checkMembreAccess(membreService.getById(id));
        membreService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Connexion membre",
            description = "Authentifie un membre avec son matricule et retourne un JWT pour accéder aux ressources protégées."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Connexion réussie : JWT retourné",
                    content = @Content(schema = @Schema(implementation = MembreResponse.class))),
            @ApiResponse(responseCode = "404", description = "Membre introuvable avec ce matricule",
                    content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<MembreResponse> login(@RequestBody MembreRequest request) {
        Membre membre = membreService.getByMatricule(request.getMatricule());
        MembreResponse response = membreMapper.toResponse(membre);
        String token = jwtConfig.generateToken(membre.getMatricule(), membre.getTypeMembre().name());
        response.setToken(token);
        return ResponseEntity.ok(response);
    }

    private void checkCurrentAccess(Membre membre) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean admin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (admin) {
            if (adminAuthorizationService.currentAdmin().getTypeAdministrateur() == TypeAdministrateur.GLOBAL) {
                return;
            }
            adminAuthorizationService.checkMembreAccess(membre);
            return;
        }

        currentMemberService.requireCurrentMember(membre.getId());
    }
}
