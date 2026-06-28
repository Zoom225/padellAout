package com.padell.padell.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String adresse;

    @Column(nullable = false)
    private LocalTime heureOuverture;

    @Column(nullable = false)
    private LocalTime heureFermeture;

    @Column(nullable = false)
    private Integer dureeMatchMinutes;

    @Column(nullable = false)
    private Integer dureeEntreMatchMinutes;

    @Column(nullable = false)
    private Integer anneeCivile;

    // Correction : Remplacer List par Set et forcer LAZY pour éviter MultipleBagFetchException
    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("site-terrains")
    @Builder.Default
    private Set<Terrain> terrains = new HashSet<>();

    // Correction : Remplacer List par Set et forcer LAZY pour éviter MultipleBagFetchException
    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("site-joursFermeture")
    @Builder.Default
    private Set<JourFermeture> joursFermeture = new HashSet<>();
}
