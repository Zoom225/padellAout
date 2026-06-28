package com.padell.padell.controller;

import com.padell.padell.dto.response.PaiementResponse;
import com.padell.padell.mapper.PaiementMapper;
import com.padell.padell.service.PaiementService;
import com.padell.padell.service.impl.CurrentMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
@Tag(name = "Paiements", description = "Endpoints de gestion des paiements de réservation. " +
        "Un paiement est créé automatiquement en EN_ATTENTE avec chaque réservation. " +
        "La réservation devient CONFIRMEE uniquement après paiement.")
public class PaiementController {

    private final PaiementService paiementService;
    private final PaiementMapper paiementMapper;
    private final CurrentMemberService currentMemberService;

    @Operation(
            summary = "Payer une réservation pour un membre donné",
            description = "Traite le paiement d'une réservation. " +
                    "Le membre connecté doit correspondre à l'ID fourni et être propriétaire de la réservation. " +
                    "Endpoint conservé pour compatibilité ; préférer /api/paiements/reservation/{reservationId}/pay.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paiement effectué et réservation confirmée",
                    content = @Content(schema = @Schema(implementation = PaiementResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paiement déjà effectué ou réservation non payable",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Réservation ou paiement introuvable",
                    content = @Content)
    })
    @PostMapping("/reservation/{reservationId}/membre/{membreId}")
    public ResponseEntity<PaiementResponse> pay(
            @Parameter(description = "ID de la réservation à payer", required = true)
            @PathVariable Long reservationId,
            @Parameter(description = "ID du membre payeur, qui doit correspondre au membre connecté", required = true)
            @PathVariable Long membreId) {
        currentMemberService.requireCurrentMember(membreId);
        return ResponseEntity.ok(
                paiementMapper.toResponse(paiementService.pay(reservationId, membreId))
        );
    }

    @Operation(
            summary = "Payer une réservation du membre connecté",
            description = "Permet au membre connecté de payer une réservation qui lui appartient. " +
                    "La place est confirmée uniquement après ce paiement.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paiement effectué et réservation confirmée",
                    content = @Content(schema = @Schema(implementation = PaiementResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paiement déjà effectué ou réservation non payable",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Accès refusé",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Réservation ou paiement introuvable",
                    content = @Content)
    })
    @PostMapping("/reservation/{reservationId}/pay")
    public ResponseEntity<PaiementResponse> payCurrentMember(
            @Parameter(description = "ID de la réservation à payer", required = true)
            @PathVariable Long reservationId) {
        Long membreId = currentMemberService.currentMemberId();
        return ResponseEntity.ok(
                paiementMapper.toResponse(paiementService.pay(reservationId, membreId))
        );
    }

    @Operation(
            summary = "Consulter un paiement",
            description = "Retourne un paiement par son ID. " +
                    "Accessible uniquement au membre propriétaire de la réservation associée.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paiement trouvé",
                    content = @Content(schema = @Schema(implementation = PaiementResponse.class))),
            @ApiResponse(responseCode = "404", description = "Paiement introuvable",
                    content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<PaiementResponse> getById(
            @Parameter(description = "ID du paiement", required = true)
            @PathVariable Long id) {
        paiementService.checkPaiementOwner(id, currentMemberService.currentMemberId());
        return ResponseEntity.ok(paiementMapper.toResponse(paiementService.getById(id)));
    }

    @Operation(
            summary = "Consulter le paiement d'une réservation",
            description = "Retourne le paiement associé à une réservation. " +
                    "Accessible uniquement au membre propriétaire de cette réservation.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paiement trouvé",
                    content = @Content(schema = @Schema(implementation = PaiementResponse.class))),
            @ApiResponse(responseCode = "404", description = "Paiement introuvable pour cette réservation",
                    content = @Content)
    })
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaiementResponse> getByReservationId(
            @Parameter(description = "ID de la réservation", required = true)
            @PathVariable Long reservationId) {
        paiementService.checkReservationPaiementOwner(reservationId, currentMemberService.currentMemberId());
        return ResponseEntity.ok(
                paiementMapper.toResponse(paiementService.getByReservationId(reservationId))
        );
    }

    @Operation(
            summary = "Lister les paiements d'un membre",
            description = "Retourne l'historique des paiements du membre indiqué. " +
                    "Accessible uniquement au membre connecté correspondant à cet ID.",
            security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paiements du membre retournés",
                    content = @Content(schema = @Schema(implementation = PaiementResponse.class))),
            @ApiResponse(responseCode = "404", description = "Membre introuvable",
                    content = @Content)
    })
    @GetMapping("/membre/{membreId}")
    public ResponseEntity<List<PaiementResponse>> getByMembreId(
            @Parameter(description = "ID du membre", required = true)
            @PathVariable Long membreId) {
        currentMemberService.requireCurrentMember(membreId);
        List<PaiementResponse> paiements = paiementService.getByMembreId(membreId)
                .stream()
                .map(paiementMapper::toResponse)
                .toList();
        return ResponseEntity.ok(paiements);
    }
}
