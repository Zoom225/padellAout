package com.padell.padell.mapper;

import com.padell.padell.dto.response.PaiementResponse;
import com.padell.padell.dto.response.ReservationResponse;
import com.padell.padell.entity.Match;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Paiement;
import com.padell.padell.entity.Reservation;
import com.padell.padell.entity.enums.StatutPaiement;
import com.padell.padell.entity.enums.StatutReservation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationMapper Tests")
class ReservationMapperTest {

    @Mock
    private PaiementMapper paiementMapper;

    @InjectMocks
    private ReservationMapper reservationMapper;

    private Reservation reservation;
    private Match match;
    private Membre membre;
    private Paiement paiement;

    @BeforeEach
    void setUp() {
        match = new Match();
        match.setId(1L);
        match.setDateDebut(LocalDateTime.of(2024, 8, 20, 19, 0));

        membre = new Membre();
        membre.setId(10L);
        membre.setNom("Doe");
        membre.setPrenom("John");

        paiement = new Paiement();
        paiement.setId(100L);
        paiement.setStatut(StatutPaiement.EN_ATTENTE);

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setMatch(match);
        reservation.setMembre(membre);
        reservation.setStatut(StatutReservation.EN_ATTENTE);
        reservation.setPaiement(paiement);
    }

    @Test
    @DisplayName("Doit mapper Reservation Entity vers ReservationResponse")
    void shouldMapReservationEntityToReservationResponse() {
        // Arrange
        PaiementResponse paiementResponse = PaiementResponse.builder()
                .id(100L)
                .statut(StatutPaiement.EN_ATTENTE)
                .build();
        when(paiementMapper.toResponse(paiement)).thenReturn(paiementResponse);

        // Act
        ReservationResponse response = reservationMapper.toResponse(reservation);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(1L, response.getMatchId());
        assertEquals(LocalDateTime.of(2024, 8, 20, 19, 0), response.getMatchDateTime());
        assertEquals(10L, response.getMembreId());
        assertEquals("John Doe", response.getMembreNom()); // Correction de l'ordre
        assertEquals(StatutReservation.EN_ATTENTE, response.getStatut());
        assertNotNull(response.getPaiement());
        assertEquals(100L, response.getPaiement().getId());
    }

    @Test
    @DisplayName("Doit gérer un Paiement null lors du mapping")
    void shouldHandleNullPaiementWhenMapping() {
        // Arrange
        reservation.setPaiement(null);

        // Act
        ReservationResponse response = reservationMapper.toResponse(reservation);

        // Assert
        assertNotNull(response);
        assertNull(response.getPaiement());
    }

    @Test
    @DisplayName("Doit lever une exception si Match ou Membre est null")
    void shouldThrowExceptionIfRequiredEntitiesAreNull() {
        // Arrange 1
        reservation.setMatch(null);

        // Act & Assert 1
        IllegalArgumentException ex1 = assertThrows(IllegalArgumentException.class, () -> {
            reservationMapper.toResponse(reservation);
        });
        assertEquals("La réservation doit avoir un match et un membre associés.", ex1.getMessage());

        // Arrange 2
        reservation.setMatch(match); // Rétablir le match
        reservation.setMembre(null);

        // Act & Assert 2
        IllegalArgumentException ex2 = assertThrows(IllegalArgumentException.class, () -> {
            reservationMapper.toResponse(reservation);
        });
        assertEquals("La réservation doit avoir un match et un membre associés.", ex2.getMessage());
    }
}
