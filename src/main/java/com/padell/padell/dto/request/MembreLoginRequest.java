package com.padell.padell.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreLoginRequest {

    @NotBlank(message = "Le matricule est obligatoire.")
    private String matricule;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    private String password;
}
