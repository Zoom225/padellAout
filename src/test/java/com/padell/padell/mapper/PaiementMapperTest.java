package com.padell.padell.mapper;

import com.padell.padell.dto.response.PaiementResponse;
import com.padell.padell.entity.Paiement;
import com.padell.padell.entity.enums.StatutPaiement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PaiementMapper Tests")
class PaiementMapperTest {

    private PaiementMapper paiementMapper;

    @BeforeEach
    void setUp() {
        paiementMapper = new PaiementMapper();
    }

    @Test
    @DisplayName("Doit mapper Paiement Entity vers PaiementResponse")
    void shouldMapPaiementEntityToPaiementResponse() {
        // Arrange
        // Correction : Construire l'objet, puis setter l'ID
        Paiement paiement = Paiement.builder()
                .montant(15.0)
                .statut(StatutPaiement.PAYE)
                .datePaiement(LocalDateTime.of(2024, 5, 1, 12, 30))
                .build();
        paiement.setId(1L); // Simule l'ID généré par la base de données

        // Act
        PaiementResponse response = paiementMapper.toResponse(paiement);

        // Assert
        assertNotNull(response);
        assertAll("Vérification du mapping de Paiement vers Response",
                () -> assertEquals(1L, response.getId()),
                () -> assertEquals(15.0, response.getMontant()),
                () -> assertEquals(StatutPaiement.PAYE, response.getStatut()),
                () -> assertEquals(LocalDateTime.of(2024, 5, 1, 12, 30), response.getDatePaiement())
        );
    }

    @Test
    @DisplayName("Doit gérer les champs null dans Paiement Entity")
    void shouldHandleNullFieldsInPaiementEntity() {
        // Arrange
        // Correction : Construire l'objet, puis setter l'ID
        Paiement paiement = Paiement.builder()
                .montant(20.0)
                .statut(StatutPaiement.EN_ATTENTE)
                .datePaiement(null) // Le paiement n'a pas encore été effectué
                .build();
        paiement.setId(2L);

        // Act
        PaiementResponse response = paiementMapper.toResponse(paiement);

        // Assert
        assertNotNull(response);
        assertAll("Vérification du mapping avec des champs null",
                () -> assertEquals(2L, response.getId()),
                () -> assertEquals(StatutPaiement.EN_ATTENTE, response.getStatut()),
                () -> assertNull(response.getDatePaiement())
        );
    }
}
