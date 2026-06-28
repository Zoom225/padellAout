package com.padell.padell.controller;

import com.padelPlay.dto.request.ReservationRequest;
import com.padelPlay.dto.response.ReservationResponse;
import com.padelPlay.entity.Membre;
import com.padelPlay.entity.Reservation;
import com.padelPlay.mapper.ReservationMapper;
import com.padelPlay.service.ReservationService;
import com.padelPlay.service.impl.CurrentMemberService;
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
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Réservations", description = "Endpoints de gestion des réservations de match. " +
        "Une réservation relie un membre à un match et génère automatiquement un paiement en attente. " +
        "La place n'est confirmée qu'après paiement : premier payé, premier servi.")
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationMapper reservationMapper;
    private final CurrentMemberService currentMemberService;

    @Operation(
            summary = "Créer une réservation",
            description = "Crée une réservation pour le membre connecté sur un match donné. " +
                    "Un paiement EN_ATTENTE est créé automatiquement. " +
                    "Pour un match PUBLIC, le membre ne peut réserver que pour lui-même. " +
                    "Pour un match PRIVÉ, seul l'organisateur peut ajouter des joueurs. " +
                    "Accessible uniquement à un membre authentifié.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Réservation créée avec un paiement en attente",
                    content = @Content(schema = @Schema(implementation = ReservationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Règle métier non respectée : match complet, membre déjà inscrit, pénalité, solde dû, mauvais site ou restriction de match privé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Match ou membre introuvable",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<ReservationResponse> create(@Valid @RequestBody ReservationRequest request) {
        Membre currentMember = currentMemberService.currentMember();
        Reservation reservation = reservationService.create(
                request.getMatchId(),
                request.getMembreId(),
                currentMember.getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationMapper.toResponse(reservation));
    }

    @Operation(
            summary = "Consulter une réservation",
            description = "Retourne une réservation par son ID. " +
                    "Accessible uniquement au membre propriétaire de la réservation.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Réservation trouvée",
                    content = @Content(schema = @Schema(implementation = ReservationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Réservation introuvable",
                    content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getById(
            @Parameter(description = "ID de la réservation", required = true)
            @PathVariable Long id) {
        Reservation reservation = reservationService.getById(id);
        currentMemberService.requireCurrentMember(reservation.getMembre().getId());
        return ResponseEntity.ok(reservationMapper.toResponse(reservation));
    }

    @Operation(
            summary = "Lister les réservations d'un match",
            description = "Retourne les réservations liées à un match. " +
                    "Accessible aux membres et aux administrateurs selon la configuration de sécurité.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Réservations du match retournées",
                    content = @Content(schema = @Schema(implementation = ReservationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Match introuvable",
                    content = @Content)
    })
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<ReservationResponse>> getByMatchId(
            @Parameter(description = "ID du match", required = true)
            @PathVariable Long matchId) {
        List<ReservationResponse> reservations = reservationService.getByMatchId(matchId)
                .stream()
                .map(reservationMapper::toResponse)
                .toList();
        return ResponseEntity.ok(reservations);
    }

    @Operation(
            summary = "Lister les réservations d'un membre",
            description = "Retourne les réservations du membre indiqué. " +
                    "Accessible uniquement au membre connecté correspondant à cet ID.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Réservations du membre retournées",
                    content = @Content(schema = @Schema(implementation = ReservationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Membre introuvable",
                    content = @Content)
    })
    @GetMapping("/membre/{membreId}")
    public ResponseEntity<List<ReservationResponse>> getByMembreId(
            @Parameter(description = "ID du membre", required = true)
            @PathVariable Long membreId) {
        currentMemberService.requireCurrentMember(membreId);
        List<ReservationResponse> reservations = reservationService.getByMembreId(membreId)
                .stream()
                .map(reservationMapper::toResponse)
                .toList();
        return ResponseEntity.ok(reservations);
    }

    @Operation(
            summary = "Annuler une réservation",
            description = "Annule une réservation existante. " +
                    "Si le paiement était PAYE, il passe à REMBOURSE. " +
                    "Si la réservation était seulement EN_ATTENTE, le nombre de joueurs confirmés n'est pas décrémenté. " +
                    "Accessible uniquement au membre propriétaire de la réservation.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Réservation annulée"),
            @ApiResponse(responseCode = "400", description = "Réservation déjà annulée",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Réservation introuvable",
                    content = @Content)
    })
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
            @Parameter(description = "ID de la réservation à annuler", required = true)
            @PathVariable Long id) {
        currentMemberService.requireCurrentMember(reservationService.getById(id).getMembre().getId());
        reservationService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
