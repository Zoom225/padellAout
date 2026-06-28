package com.padell.padell.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padell.padell.config.JwtConfig;
import com.padell.padell.config.SecurityConfig;
import com.padell.padell.dto.request.MembreRequest;
import com.padell.padell.dto.response.MembreResponse;
import com.padell.padell.entity.Membre;
import com.padell.padell.mapper.MembreMapper;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.service.MembreService;
import com.padell.padell.service.SiteService;
import com.padell.padell.service.impl.AdminAuthorizationService;
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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(SecurityConfig.class)
@WebMvcTest(controllers = MembreController.class)
@DisplayName("MembreController Tests")
class MembreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MembreService membreService;
    @MockBean
    private SiteService siteService;
    @MockBean
    private MembreMapper membreMapper;
    @MockBean
    private AdminAuthorizationService adminAuthorizationService;
    @MockBean
    private CurrentMemberService currentMemberService;

    @MockBean
    private JwtConfig jwtConfig;
    @MockBean
    private AdministrateurRepository administrateurRepository;
    @MockBean
    private MembreRepository membreRepository;

    private MembreRequest membreRequest;
    private MembreResponse membreResponse;

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
        when(membreService.create(any(Membre.class))).thenReturn(new Membre());
        when(membreMapper.toEntity(any(MembreRequest.class))).thenReturn(new Membre());
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
}
