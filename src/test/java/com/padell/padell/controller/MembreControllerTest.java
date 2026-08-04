package com.padell.padell.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padell.padell.config.JwtConfig;
import com.padell.padell.config.SecurityConfig;
import com.padell.test.TestSecurityConfig;
import com.padell.padell.dto.request.MembreLoginRequest;
import com.padell.padell.dto.request.MembreRequest;
import com.padell.padell.dto.response.MembreResponse;
import com.padell.padell.entity.Membre;
import com.padell.padell.mapper.MembreMapper;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.service.MembreService;
import com.padell.padell.service.impl.CurrentMemberService;
import com.padell.padell.service.impl.MembreAccessService;
import com.padell.padell.service.impl.MembreCreationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import({SecurityConfig.class, TestSecurityConfig.class})
@WebMvcTest(controllers = MembreController.class)
@DisplayName("Tests de MembreController")
class MembreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MembreService membreService;
    @MockitoBean
    private MembreMapper membreMapper;
    @MockitoBean
    private MembreAccessService membreAccessService;
    @MockitoBean
    private MembreCreationService membreCreationService;
    @MockitoBean
    private CurrentMemberService currentMemberService;

    @MockitoBean
    private JwtConfig jwtConfig;
    @MockitoBean
    private AdministrateurRepository administrateurRepository;
    @MockitoBean
    private MembreRepository membreRepository;

    private MembreRequest membreRequest;
    private MembreResponse membreResponse;
    private Membre membreEntity; // Added for authenticate mock

    @BeforeEach
    void setUp() {
        membreRequest = new MembreRequest();
        membreRequest.setMatricule("L12345");
        membreRequest.setNom("Doe");
        membreRequest.setPrenom("John");
        membreRequest.setTypeMembre(com.padell.padell.entity.enums.TypeMembre.GLOBAL);

        membreResponse = new MembreResponse();
        membreResponse.setId(1L);
        membreResponse.setMatricule("L12345");

        membreEntity = new Membre(); // Initialize membreEntity
        membreEntity.setId(1L);
        membreEntity.setMatricule("L12345");
        membreEntity.setTypeMembre(com.padell.padell.entity.enums.TypeMembre.LIBRE);
    }

    @Test
    @DisplayName("POST /api/membres - Doit refuser la creation sans authentification")
    void createMember_WithoutAuthentication_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/membres")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(membreRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MEMBER")
    @DisplayName("POST /api/membres - Doit refuser la creation avec un role membre")
    void createMember_WithMemberRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/membres")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(membreRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/membres - Doit creer un membre avec un role admin")
    void createMember_WithAdminRole_ShouldReturnCreated() throws Exception {
        when(membreCreationService.create(any(MembreRequest.class))).thenReturn(membreEntity);
        when(membreMapper.toResponse(any(Membre.class))).thenReturn(membreResponse);

        mockMvc.perform(post("/api/membres")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(membreRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/membres/{id} - Doit mettre à jour un membre avec un rôle autorisé")
    void updateMember_WithAuthorizedRole_ShouldReturnOk() throws Exception {
        when(membreService.update(anyLong(), any(Membre.class))).thenReturn(new Membre());
        when(membreMapper.toEntity(any(MembreRequest.class))).thenReturn(new Membre());
        when(membreMapper.toResponse(any(Membre.class))).thenReturn(membreResponse);

        mockMvc.perform(put("/api/membres/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(membreRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "MEMBER")
    @DisplayName("PUT /api/membres/{id} - Doit retourner 403 pour un rôle non autorisé")
    void updateMember_WithUnauthorizedRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(put("/api/membres/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(membreRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/membres/{id} - Doit supprimer un membre avec un rôle autorisé")
    void deleteMember_WithAuthorizedRole_ShouldReturnNoContent() throws Exception {
        doNothing().when(membreService).delete(1L);

        mockMvc.perform(delete("/api/membres/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST /api/membres/login - Doit authentifier un membre et retourner un token")
    void loginMembre_ShouldAuthenticateAndReturnToken() throws Exception {
        MembreLoginRequest loginRequest = new MembreLoginRequest("L12345", "Membre1234!");
        when(membreService.authenticate("L12345", "Membre1234!")).thenReturn(membreEntity);
        when(membreMapper.toResponse(any(Membre.class))).thenReturn(membreResponse);
        when(jwtConfig.generateToken(anyString(), anyString(), anyString())).thenReturn("mocked-jwt-token");

        mockMvc.perform(post("/api/membres/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matricule").value("L12345"))
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"));
    }
}
