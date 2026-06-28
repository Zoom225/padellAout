package com.padell.padell.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TerrainRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    @NotNull(message = "L'ID du site est obligatoire.")
    private Long siteId;
}
