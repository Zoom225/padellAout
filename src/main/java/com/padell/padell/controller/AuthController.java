package com.padell.padell.controller;

import com.padell.padell.dto.request.LoginRequest;
import com.padell.padell.dto.response.LoginResponse;
import com.padell.padell.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints d'authentification des administrateurs. " +
        "Les membres ne s'authentifient pas ici : ils utilisent leur matricule via /api/membres/login. " +
        "Ce flux est réservé aux administrateurs GLOBAL ou SITE qui doivent accéder aux endpoints de gestion. " +
        "Le serveur retourne un JWT valable 24 heures après validation des identifiants.")
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Connexion administrateur",
            description = "Authentifie un administrateur avec son e-mail et son mot de passe. " +
                    "Retourne un JWT à envoyer dans l'en-tête Authorization pour les endpoints protégés. " +
                    "Cet endpoint est public, mais il est réservé à la connexion administrateur."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Connexion réussie : JWT retourné",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Identifiants invalides : e-mail ou mot de passe incorrect.",
                    content = @Content),
            @ApiResponse(responseCode = "400", description = "Erreur de validation : champ manquant ou format invalide.",
                    content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
