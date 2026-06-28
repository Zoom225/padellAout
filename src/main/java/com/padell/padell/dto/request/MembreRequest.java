package com.padell.padell.dto.request;

import com.padelPlay.entity.enums.TypeMembre;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreRequest {

    @NotBlank(message = "Le matricule est obligatoire.")
    private String matricule;

    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire.")
    private String prenom;

    @Email(message = "Le format de l'e-mail est invalide.")
    private String email;

    @NotNull(message = "Le type de membre est obligatoire.")
    private TypeMembre typeMembre;

    private Long siteId;
}
