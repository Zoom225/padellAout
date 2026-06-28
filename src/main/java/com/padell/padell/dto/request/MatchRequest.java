package com.padell.padell.dto.request;

import com.padelPlay.entity.enums.TypeMatch;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRequest {

    @NotNull(message = "L'ID du terrain est obligatoire.")
    private Long terrainId;

    @NotNull(message = "L'ID de l'organisateur est obligatoire.")
    private Long organisateurId;

    @NotNull(message = "La date est obligatoire.")
    @Future(message = "La date du match doit être dans le futur.")
    private LocalDate date;

    @NotNull(message = "L'heure de début est obligatoire.")
    private LocalTime heureDebut;

    @NotNull(message = "Le type de match est obligatoire.")
    private TypeMatch typeMatch;
}
