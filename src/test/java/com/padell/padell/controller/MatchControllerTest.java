package com.padell.padell.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padell.padell.config.JwtConfig;
import com.padell.padell.entity.enums.StatutMatch;
import com.padell.padell.entity.enums.TypeMatch;
import com.padell.padell.dto.request.CreateMatchRequest;
import com.padell.padell.dto.response.MatchDto;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.service.MatchService;
import com.padell.padell.service.impl.AdminAuthorizationService;
import com.padell.padell.service.impl.CurrentMemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Étape 1 : Importer la configuration de sécurité
//@Import(SecurityConfig.class)
// Étape 2 : Cibler le contrôleur
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(controllers = MatchController.class)
@DisplayName("MatchController Tests")
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MatchService matchService;
    @MockBean
    private AdminAuthorizationService adminAuthorizationService;
    @MockBean
    private CurrentMemberService currentMemberService;

    // Étape 3 : Mocker les dépendances de la chaîne de sécurité (Je wtAuthenticationFilter)
    @MockBean
    private JwtConfig jwtConfig;
    @MockBean
    private AdministrateurRepository administrateurRepository;
    @MockBean
    private MembreRepository membreRepository;


    private CreateMatchRequest validCreateMatchRequest;
    private MatchDto matchDto;

    @BeforeEach
    void setUp() {
        LocalDateTime startTime = LocalDateTime.now().plusDays(10).withNano(0);
        validCreateMatchRequest = new CreateMatchRequest(1L, startTime, "PUBLIC");

        matchDto = new MatchDto(
                1L,                                        // id
                1L,                                        // terrainId
                "Court Central",                           // terrainNom
                "Padel Club Lyon",                         // siteNom
                10L,                                       // organisateurId
                "John Doe",                                // organisateurNom
                startTime.toLocalDate(),                   // date
                startTime.toLocalTime(),                   // heureDebut
                startTime.plusMinutes(90).toLocalTime(),   // heureFin
                TypeMatch.PUBLIC,                          // typeMatch
                StatutMatch.PLANIFIE,                      // statut
                1,                                         // nbJoueursActuels
                15.0,                                      // prixParJoueur
                null                                       // dateConversionPublic
        );
    }

    @Test
    @WithMockUser(username = "membre.test", roles = "LIBRE")
    @DisplayName("POST /api/matches - Doit créer un match pour un rôle autorisé")
    void createMatch_WithAuthorizedRole_ShouldReturnCreated() throws Exception {
        when(matchService.createMatch(any(CreateMatchRequest.class), anyString())).thenReturn(matchDto);

        mockMvc.perform(post("/api/matches")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateMatchRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(matchDto.id()));
    }




    @Test
    @DisplayName("GET /api/matches/public - Doit retourner les matchs publics sans authentification")
    void getPublicMatches_WithoutAuthentication_ShouldReturnOk() throws Exception {
        when(matchService.getPublicAvailableMatches()).thenReturn(List.of(matchDto));

        mockMvc.perform(get("/api/matches/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(matchDto.id()));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/matches - Doit retourner tous les matchs pour un utilisateur authentifié")
    void getAllMatches_WithAuthenticatedUser_ShouldReturnOk() throws Exception {
        when(matchService.findAllMatches()).thenReturn(List.of(matchDto));
        when(adminAuthorizationService.filterMatchDtos(any())).thenReturn(List.of(matchDto));

        mockMvc.perform(get("/api/matches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(matchDto.id()));
    }
}
