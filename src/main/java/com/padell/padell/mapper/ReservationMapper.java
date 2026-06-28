package com.padell.padell.mapper;

import com.padelPlay.dto.response.ReservationResponse;
import com.padelPlay.entity.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReservationMapper {

    private final PaiementMapper paiementMapper;

    public ReservationResponse toResponse(Reservation reservation) {
        if (reservation == null) {
            return null;
        }

        // Gestion des relations potentiellement nulles pour éviter les NullPointerExceptions
        if (reservation.getMatch() == null || reservation.getMembre() == null) {
            // Il est préférable de lever une exception ou de retourner un DTO invalide
            // plutôt que de laisser une NullPointerException se produire.
            // Pour cet exemple, nous retournons null, mais une exception serait plus claire.
            throw new IllegalArgumentException("La réservation doit avoir un match et un membre associés.");
        }

        return ReservationResponse.builder()
                .id(reservation.getId())
                .matchId(reservation.getMatch().getId())
                // Correction : Utiliser directement le champ dateDebut
                .matchDateTime(reservation.getMatch().getDateDebut())
                .membreId(reservation.getMembre().getId())
                .membreNom(reservation.getMembre().getPrenom() + " " + reservation.getMembre().getNom())
                .statut(reservation.getStatut())
                .paiement(reservation.getPaiement() != null
                        ? paiementMapper.toResponse(reservation.getPaiement())
                        : null)
                .build();
    }
}
