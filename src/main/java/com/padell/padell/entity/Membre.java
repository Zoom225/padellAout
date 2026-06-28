package com.padell.padell.entity;

import com.padelPlay.entity.enums.TypeMembre;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "membres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membre extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String matricule;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMembre typeMembre;

    @Column(nullable = false)
    private Double solde;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    // Correction : Remplacer List par Set et forcer LAZY
    @OneToMany(mappedBy = "organisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Match> matchesOrganises = new HashSet<>();

    // Correction : Remplacer List par Set et forcer LAZY
    @OneToMany(mappedBy = "membre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Reservation> reservations = new HashSet<>();

    // Correction : Remplacer List par Set et forcer LAZY
    @OneToMany(mappedBy = "membre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Penalite> penalites = new HashSet<>();
}
