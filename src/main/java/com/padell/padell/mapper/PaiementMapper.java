package com.padell.padell.mapper;

import com.padelPlay.dto.response.PaiementResponse;
import com.padelPlay.entity.Paiement;
import org.springframework.stereotype.Component;

@Component
public class PaiementMapper {

    public PaiementResponse toResponse(Paiement paiement) {
        return PaiementResponse.builder()
                .id(paiement.getId())
                .montant(paiement.getMontant())
                .statut(paiement.getStatut())
                .datePaiement(paiement.getDatePaiement())
                .build();
    }
}
