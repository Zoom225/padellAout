package com.padell.padell.dto.response;

import com.padelPlay.entity.enums.StatutPaiement;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaiementResponse {
    private Long id;
    private Double montant;
    private StatutPaiement statut;
    private LocalDateTime datePaiement;
}
