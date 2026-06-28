package com.padell.padell.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.padelPlay.entity.enums.StatutPaiement;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    @JsonBackReference("reservation-paiement")
    private Reservation reservation;

    @Column(nullable = false)
    private Double montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPaiement statut;

    private LocalDateTime datePaiement;
}
