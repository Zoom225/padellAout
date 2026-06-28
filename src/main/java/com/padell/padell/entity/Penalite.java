package com.padell.padell.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "penalites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Penalite extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Column(nullable = false)
    private String motif;
}
