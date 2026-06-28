package com.padell.padell.dto.response;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteResponse {
    private Long id;
    private String nom;
    private String adresse;
    private LocalTime heureOuverture;
    private LocalTime heureFermeture;
    private Integer dureeMatchMinutes;
    private Integer dureeEntreMatchMinutes;
    private Integer anneeCivile;
}
