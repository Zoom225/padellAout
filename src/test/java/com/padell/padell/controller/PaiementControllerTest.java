package com.padell.padell.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padell.padell.config.JwtConfig;
import com.padell.padell.config.SecurityConfig;
import com.padell.padell.dto.response.PaiementResponse;
import com.padell.padell.entity.Paiement;
import com.padell.padell.mapper.PaiementMapper;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.service.PaiementService;
import com.padell.padell.service.impl.CurrentMemberService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(SecurityConfig.class)
@WebMvcTest(controllers = PaiementController.class)
@DisplayName("PaiementController Tests")
class PaiementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaiementService paiementService;
    @MockBean
    private PaiementMapper paiementMapper;
    @MockBean
    private CurrentMemberService currentMemberService;

    @MockBean
    private JwtConfig jwtConfig;
    @MockBean
    private AdministrateurRepository administrateurRepository;
    @MockBean
    private MembreRepository membreRepository;

    private Paiement paiement;
    private PaiementResponse paiementResponse;

    @BeforeEach
    void setUp() {
        paiement = new Paiement();
        paiement.setId(1L);
        paiement.setMontant(15.0);

        paiementResponse = new PaiementResponse();
        paiementResponse.setId(1L);
        paiementResponse.setMontant(15.0);
    }

    @Test
    @WithMockUser(roles = "MEMBER")
    @DisplayName("POST /paiements/reservation/{resId}/membre/{memId} - Doit traiter un paiement")
    void pay_ShouldProcessPayment_AndReturnOk() throws Exception {
        when(paiementService.pay(anyLong(), anyLong())).thenReturn(paiement);
        when(paiementMapper.toResponse(any(Paiement.class))).thenReturn(paiementResponse);
        when(currentMemberService.currentMemberId()).thenReturn(1L);

        mockMvc.perform(post("/api/paiements/reservation/1/membre/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.montant").value(15.0));
    }

    @Test
    @WithMockUser(roles = "MEMBER")
    @DisplayName("GET /paiements/{id} - Doit retourner un paiement par ID")
    void getById_ShouldReturnPayment_WhenFound() throws Exception {
        when(paiementService.getById(1L)).thenReturn(paiement);
        when(paiementMapper.toResponse(any(Paiement.class))).thenReturn(paiementResponse);
        when(currentMemberService.currentMemberId()).thenReturn(1L);

        mockMvc.perform(get("/api/paiements/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }
}
