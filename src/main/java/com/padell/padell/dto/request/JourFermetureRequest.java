package com.padell.padell.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourFermetureRequest {

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

    private String raison;

    @NotNull(message = "Le type de fermeture est obligatoire")
    private Boolean global;

    private Long siteId;
}
