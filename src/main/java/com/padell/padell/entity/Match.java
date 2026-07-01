package com.padell.padell.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.padell.padell.entity.enums.StatutMatch;
import com.padell.padell.entity.enums.TypeMatch;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "terrain_id", nullable = false)
    @JsonBackReference("terrain-matches")
    private Terrain terrain;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisateur_id", nullable = false)
    private Membre organisateur;

    @Column(nullable = false)
    private LocalDateTime dateDebut;

    @Column(nullable = false)
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMatch typeMatch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutMatch statut;

    @Column(nullable = false)
    private Integer nbJoueursActuels;

    @Column(nullable = false)
    private Double prixTotal;

    @Column(nullable = false)
    private Double prixParJoueur;

    private LocalDateTime dateConversionPublic;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("match-reservations")
    private List<Reservation> reservations;

    // L'entité est maintenant un simple POJO qui représente la table de la base de données.
    // Toute la logique de manipulation des dates a été déplacée dans la couche service.
}
