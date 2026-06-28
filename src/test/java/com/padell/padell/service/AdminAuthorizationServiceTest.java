package com.padell.padell.service;

import com.padell.padell.entity.Administrateur;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.Terrain;
import com.padell.padell.entity.enums.TypeAdministrateur;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.MatchRepository;
import com.padell.padell.service.impl.AdminAuthorizationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminAuthorizationService tests")
class AdminAuthorizationServiceTest {

    @Mock
    private AdministrateurRepository administrateurRepository;
    @Mock
    private MatchRepository matchRepository;

    private AdminAuthorizationService adminAuthorizationService;
    private Site siteLyon;
    private Site siteParis;

    @BeforeEach
    void setUp() {
        adminAuthorizationService = new AdminAuthorizationService(administrateurRepository, matchRepository);
        siteLyon = Site.builder().nom("Padel Club Lyon").build();
        siteLyon.setId(1L);
        siteParis = Site.builder().nom("Padel Club Paris").build();
        siteParis.setId(2L);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Un admin GLOBAL peut accéder à tous les sites")
    void globalAdminCanAccessEverySite() {
        String adminEmail = "admin@padel.com";
        authenticate(adminEmail);
        when(administrateurRepository.findByEmail(adminEmail))
                .thenReturn(Optional.of(admin(adminEmail, TypeAdministrateur.GLOBAL, null)));

        adminAuthorizationService.checkSiteAccess(siteParis.getId());
    }

    @Test
    @DisplayName("Un admin SITE peut accéder uniquement à son site")
    void siteAdminCanAccessOwnSiteOnly() {
        String adminEmail = "admin.lyon@padel.com";
        authenticate(adminEmail);
        when(administrateurRepository.findByEmail(adminEmail))
                .thenReturn(Optional.of(admin(adminEmail, TypeAdministrateur.SITE, siteLyon)));

        adminAuthorizationService.checkSiteAccess(siteLyon.getId());
        assertThatThrownBy(() -> adminAuthorizationService.checkSiteAccess(siteParis.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("son propre site");
    }

    @Test
    @DisplayName("Un admin SITE sans site rattaché est refusé")
    void siteAdminWithoutSiteIsRejected() {
        String adminEmail = "admin.site@padel.com";
        authenticate(adminEmail);
        when(administrateurRepository.findByEmail(adminEmail))
                .thenReturn(Optional.of(admin(adminEmail, TypeAdministrateur.SITE, null)));

        assertThatThrownBy(() -> adminAuthorizationService.checkSiteAccess(siteLyon.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("son propre site");
    }

    @Test
    @DisplayName("Un admin SITE ne peut gérer que les membres de son site")
    void siteAdminCanManageOnlyOwnMembers() {
        String adminEmail = "admin.lyon@padel.com";
        authenticate(adminEmail);
        // La ligne suivante est la ligne 94 dans le fichier de test si le reste est identique.
        // Elle doit stuber avec 'adminEmail' qui est "admin.lyon@padel.com"
        when(administrateurRepository.findByEmail(adminEmail))
                .thenReturn(Optional.of(admin(adminEmail, TypeAdministrateur.SITE, siteLyon)));

        Membre membreParis = Membre.builder().site(siteParis).build();

        assertThatThrownBy(() -> adminAuthorizationService.checkMembreAccess(membreParis))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("membres de son site");
    }

    @Test
    @DisplayName("Un admin SITE ne peut gérer que les terrains de son site")
    void siteAdminCanManageOnlyOwnTerrains() {
        String adminEmail = "admin.lyon@padel.com";
        authenticate(adminEmail);
        when(administrateurRepository.findByEmail(adminEmail))
                .thenReturn(Optional.of(admin(adminEmail, TypeAdministrateur.SITE, siteLyon)));

        Terrain terrainParis = Terrain.builder().site(siteParis).build();

        assertThatThrownBy(() -> adminAuthorizationService.checkTerrainAccess(terrainParis))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("son propre site");
    }

    private void authenticate(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null)
        );
    }

    // Méthode admin modifiée pour accepter l'email
    private Administrateur admin(String email, TypeAdministrateur type, Site site) {
        return Administrateur.builder()
                .email(email) // Utilise l'email passé en paramètre
                .typeAdministrateur(type)
                .site(site)
                .build();
    }
}