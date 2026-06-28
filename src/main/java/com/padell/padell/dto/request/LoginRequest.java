package com.padell.padell.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "L'e-mail est obligatoire.")
    @Email(message = "Le format de l'e-mail est invalide.")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    private String password;
}
