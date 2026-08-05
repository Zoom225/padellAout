package com.padell.padell.mapper;

import com.padell.padell.dto.response.PaiementResponse;
import com.padell.padell.entity.Paiement;
import org.springframework.stereotype.Component;

@Component
public class PaiementMapper {

    public PaiementResponse toResponse(Paiement paiement) {
        return PaiementResponse.builder()
                .id(paiement.getId())
                .reservationId(paiement.getReservation() != null ? paiement.getReservation().getId() : null)
                .montant(paiement.getMontant())
                .statut(paiement.getStatut())
                .datePaiement(paiement.getDatePaiement())
                .build();
    }
}
