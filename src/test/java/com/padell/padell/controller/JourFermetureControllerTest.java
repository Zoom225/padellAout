package com.padell.padell.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padell.padell.config.JwtAuthenticationFilter;
import com.padell.padell.config.JwtConfig;
import com.padell.padell.dto.request.JourFermetureRequest;
import com.padell.padell.entity.Administrateur;
import com.padell.padell.entity.JourFermeture;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.enums.TypeAdministrateur;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.JourFermetureRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.service.SiteService;
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

import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(controllers = JourFermetureController.class)
@DisplayName("JourFermetureController tests")
class JourFermetureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JourFermetureRepository jourFermetureRepository;

    @MockBean
    private SiteService siteService;

    @MockBean
    private AdministrateurRepository administrateurRepository;

    @MockBean
    private MembreRepository membreRepository;

    @MockBean
    private JwtConfig jwtConfig;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private Site siteLyon;
    private Site siteParis;

    @BeforeEach
    void setUp() {
        siteLyon = Site.builder().nom("Padel Club Lyon").build();
        siteLyon.setId(1L);
        siteParis = Site.builder().nom("Padel Club Paris").build();
        siteParis.setId(2L);
    }

    @Test
    @WithMockUser(username = "admin@padel.com", roles = "ADMIN")
    @DisplayName("Un admin GLOBAL peut créer une fermeture globale")
    void globalAdminCanCreateGlobalClosingDay() throws Exception {
        when(administrateurRepository.findByEmail("admin@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.GLOBAL, null)));
        when(jourFermetureRepository.save(any(JourFermeture.class))).thenAnswer(invocation -> {
            JourFermeture jour = invocation.getArgument(0);
            jour.setId(10L);
            return jour;
        });

        JourFermetureRequest request = JourFermetureRequest.builder()
                .date(LocalDate.of(2026, 12, 25))
                .raison("Noël")
                .global(true)
                .build();

        mockMvc.perform(post("/api/jours-fermeture")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.global").value(true));
    }

    @Test
    @WithMockUser(username = "admin.lyon@padel.com", roles = "ADMIN")
    @DisplayName("Un admin SITE ne peut pas créer une fermeture globale")
    void siteAdminCannotCreateGlobalClosingDay() throws Exception {
        when(administrateurRepository.findByEmail("admin.lyon@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, siteLyon)));

        JourFermetureRequest request = JourFermetureRequest.builder()
                .date(LocalDate.of(2026, 12, 25))
                .raison("Noël")
                .global(true)
                .build();

        mockMvc.perform(post("/api/jours-fermeture")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Seul un admin GLOBAL peut créer une fermeture globale."));
    }

    @Test
    @WithMockUser(username = "admin.lyon@padel.com", roles = "ADMIN")
    @DisplayName("Un admin SITE peut créer une fermeture sur son site")
    void siteAdminCanCreateOwnSiteClosingDay() throws Exception {
        when(administrateurRepository.findByEmail("admin.lyon@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, siteLyon)));
        when(siteService.getById(1L)).thenReturn(siteLyon);
        when(jourFermetureRepository.save(any(JourFermeture.class))).thenAnswer(invocation -> {
            JourFermeture jour = invocation.getArgument(0);
            jour.setId(11L);
            return jour;
        });

        JourFermetureRequest request = JourFermetureRequest.builder()
                .date(LocalDate.of(2026, 7, 14))
                .raison("Maintenance")
                .global(false)
                .siteId(1L)
                .build();

        mockMvc.perform(post("/api/jours-fermeture")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.siteId").value(1L));
    }

    @Test
    @WithMockUser(username = "admin.lyon@padel.com", roles = "ADMIN")
    @DisplayName("Un admin SITE ne peut pas supprimer une fermeture globale")
    void siteAdminCannotDeleteGlobalClosingDay() throws Exception {
        when(administrateurRepository.findByEmail("admin.lyon@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, siteLyon)));
        when(jourFermetureRepository.findById(10L))
                .thenReturn(Optional.of(JourFermeture.builder().global(true).build()));

        mockMvc.perform(delete("/api/jours-fermeture/10").with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Seul un admin GLOBAL peut supprimer une fermeture globale."));
    }

    @Test
    @WithMockUser(username = "admin.lyon@padel.com", roles = "ADMIN")
    @DisplayName("Un admin SITE ne peut pas supprimer une fermeture d'un autre site")
    void siteAdminCannotDeleteOtherSiteClosingDay() throws Exception {
        when(administrateurRepository.findByEmail("admin.lyon@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, siteLyon)));
        when(jourFermetureRepository.findById(12L))
                .thenReturn(Optional.of(JourFermeture.builder().global(false).site(siteParis).build()));

        mockMvc.perform(delete("/api/jours-fermeture/12").with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Un admin SITE ne peut agir que sur son propre site."));
    }

    @Test
    @WithMockUser(username = "admin@padel.com", roles = "ADMIN")
    @DisplayName("Un admin GLOBAL peut supprimer une fermeture")
    void globalAdminCanDeleteClosingDay() throws Exception {
        when(administrateurRepository.findByEmail("admin@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.GLOBAL, null)));
        JourFermeture jour = JourFermeture.builder().global(true).build();
        when(jourFermetureRepository.findById(10L)).thenReturn(Optional.of(jour));
        doNothing().when(jourFermetureRepository).delete(jour);

        mockMvc.perform(delete("/api/jours-fermeture/10").with(csrf()))
                .andExpect(status().isNoContent());
    }

    private Administrateur admin(TypeAdministrateur type, Site site) {
        return Administrateur.builder()
                .typeAdministrateur(type)
                .site(site)
                .build();
    }
}
