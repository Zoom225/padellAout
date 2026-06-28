package com.padell.padell.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.padell.padell.entity.enums.StatutReservation;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    @JsonBackReference("match-reservations")
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutReservation statut;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("reservation-paiement")
    private Paiement paiement;
}
