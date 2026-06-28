package com.padell.padell.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padell.padell.config.JwtAuthenticationFilter;
import com.padell.padell.config.JwtConfig;
import com.padell.padell.config.SecurityConfig;
import com.padell.padell.dto.request.ReservationRequest;
import com.padell.padell.dto.response.ReservationResponse;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Reservation;
import com.padell.padell.mapper.ReservationMapper;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.service.ReservationService;
import com.padell.padell.service.impl.CurrentMemberService;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(SecurityConfig.class)
@WebMvcTest(controllers = ReservationController.class)
@DisplayName("ReservationController Tests")
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReservationService reservationService;
    @MockBean
    private ReservationMapper reservationMapper;
    @MockBean
    private CurrentMemberService currentMemberService;

    @MockBean
    private JwtConfig jwtConfig;
    @MockBean
    private AdministrateurRepository administrateurRepository;
    @MockBean
    private MembreRepository membreRepository;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    private ReservationRequest reservationRequest;
    private ReservationResponse reservationResponse;
    private Membre currentMember;
    private Reservation reservation;

    @BeforeEach
    void setUp() throws ServletException, IOException {
        // ← mettre doAnswer ici comme toi
        doAnswer(invocation -> {
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());

        reservationRequest = new ReservationRequest();
        reservationRequest.setMatchId(1L);
        reservationRequest.setMembreId(1L);
        reservationRequest.setRequesterId(1L);

        reservationResponse = new ReservationResponse();
        reservationResponse.setId(1L);

        currentMember = Membre.builder().matricule("G1001").nom("Martin").prenom("Lucas").build();
        currentMember.setId(1L);

        reservation = Reservation.builder().membre(currentMember).build();
        reservation.setId(1L);
    }

    @Test
    @WithMockUser(roles = "MEMBER")
    @DisplayName("POST /api/reservations - Doit créer une réservation pour un utilisateur authentifié")
    void createReservation_WithAuthenticatedUser_ShouldReturnCreated() throws Exception {
        when(reservationService.create(anyLong(), anyLong(), anyLong())).thenReturn(new Reservation());
        when(reservationMapper.toResponse(any(Reservation.class))).thenReturn(reservationResponse);
        when(currentMemberService.currentMember()).thenReturn(currentMember);

        mockMvc.perform(post("/api/reservations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservationRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("POST /api/reservations - Doit retourner 401 si non authentifié")
    void createReservation_WithoutAuthentication_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservationRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MEMBER")
    @DisplayName("PATCH /api/reservations/{id}/cancel - Doit annuler une réservation pour un utilisateur authentifié")

    void cancelReservation_WithAuthenticatedUser_ShouldReturnOk() throws Exception {

        doNothing().when(reservationService).cancel(1L);
        when(reservationService.getById(1L)).thenReturn(reservation);
        doNothing().when(currentMemberService).requireCurrentMember(1L);

        mockMvc.perform(patch("/api/reservations/1/cancel")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /api/reservations/{id}/cancel - Doit retourner 401 si non authentifié")
    void cancelReservation_WithoutAuthentication_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(patch("/api/reservations/1/cancel")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
