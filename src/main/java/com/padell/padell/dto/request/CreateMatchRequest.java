package com.padell.padell.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

public record CreateMatchRequest(
    @NotNull(message = "L'ID du terrain est obligatoire")
    Long terrainId,

    @NotNull(message = "La date et l'heure du match sont obligatoires")
    @FutureOrPresent(message = "La date du match doit etre dans le futur ou le present")
    LocalDateTime matchDate,

    @NotBlank(message = "Le type de match est obligatoire")
    @Pattern(regexp = "PUBLIC|PRIVE", message = "Le type de match doit etre PUBLIC ou PRIVE")
    String matchType // PUBLIC ou PRIVE
) {}
