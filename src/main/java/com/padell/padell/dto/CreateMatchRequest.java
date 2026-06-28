package com.padell.padell.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateMatchRequest(
    @NotNull(message = "L'ID du terrain est obligatoire")
    Long terrainId,

    @NotNull(message = "La date et l'heure du match sont obligatoires")
    @FutureOrPresent(message = "La date du match doit être dans le futur ou le présent")
    LocalDateTime matchDate,

    @NotNull(message = "Le type de match est obligatoire")
    @Size(min = 1, message = "Le type de match ne peut pas être vide")
    String matchType // PUBLIC ou PRIVE
) {}
