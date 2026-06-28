package com.padell.padell.dto.response;

import com.padelPlay.entity.enums.StatutReservation;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {
    private Long id;
    private Long matchId;
    private LocalDateTime matchDateTime;
    private Long membreId;
    private String membreNom;
    private StatutReservation statut;
    private PaiementResponse paiement;
}
