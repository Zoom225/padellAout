package com.padell.padell.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationInviteRequest {

    @NotNull(message = "L'ID du match est obligatoire")
    private Long matchId;

    @NotEmpty(message = "Au moins un matricule invité est obligatoire")
    private List<String> inviteeMatricules;
}
