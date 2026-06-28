package com.padell.padell.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire.")
    private String adresse;

    @NotNull(message = "L'heure d'ouverture est obligatoire.")
    private LocalTime heureOuverture;

    @NotNull(message = "L'heure de fermeture est obligatoire.")
    private LocalTime heureFermeture;

    @NotNull(message = "La durée du match est obligatoire.")
    @Min(value = 1, message = "La durée du match doit être d'au moins 1 minute.")
    private Integer dureeMatchMinutes;

    @NotNull(message = "La durée de pause est obligatoire.")
    @Min(value = 0, message = "La durée de pause doit être positive.")
    private Integer dureeEntreMatchMinutes;

    @NotNull(message = "L'année civile est obligatoire.")
    private Integer anneeCivile;
}
