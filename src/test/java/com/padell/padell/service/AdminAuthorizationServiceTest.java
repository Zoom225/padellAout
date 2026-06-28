package com.padell.padell.service;

import com.padelPlay.entity.Administrateur;
import com.padelPlay.entity.Membre;
import com.padelPlay.entity.Site;
import com.padelPlay.entity.Terrain;
import com.padelPlay.entity.enums.TypeAdministrateur;
import com.padelPlay.exception.BusinessException;
import com.padelPlay.repository.AdministrateurRepository;
import com.padelPlay.service.impl.AdminAuthorizationService;
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

    private AdminAuthorizationService adminAuthorizationService;
    private Site siteLyon;
    private Site siteParis;

    @BeforeEach
    void setUp() {
        adminAuthorizationService = new AdminAuthorizationService(administrateurRepository);
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
        authenticate("admin@padel.com");
        when(administrateurRepository.findByEmail("admin@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.GLOBAL, null)));

        adminAuthorizationService.checkSiteAccess(siteParis.getId());
    }

    @Test
    @DisplayName("Un admin SITE peut accéder uniquement à son site")
    void siteAdminCanAccessOwnSiteOnly() {
        authenticate("admin.lyon@padel.com");
        when(administrateurRepository.findByEmail("admin.lyon@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, siteLyon)));

        adminAuthorizationService.checkSiteAccess(siteLyon.getId());
        assertThatThrownBy(() -> adminAuthorizationService.checkSiteAccess(siteParis.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("son propre site");
    }

    @Test
    @DisplayName("Un admin SITE sans site rattaché est refusé")
    void siteAdminWithoutSiteIsRejected() {
        authenticate("admin.site@padel.com");
        when(administrateurRepository.findByEmail("admin.site@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, null)));

        assertThatThrownBy(() -> adminAuthorizationService.checkSiteAccess(siteLyon.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("son propre site");
    }

    @Test
    @DisplayName("Un admin SITE ne peut gérer que les membres de son site")
    void siteAdminCanManageOnlyOwnMembers() {
        authenticate("admin.lyon@padel.com");
        when(administrateurRepository.findByEmail("admin.lyon@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, siteLyon)));

        Membre membreParis = Membre.builder().site(siteParis).build();

        assertThatThrownBy(() -> adminAuthorizationService.checkMembreAccess(membreParis))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("membres de son site");
    }

    @Test
    @DisplayName("Un admin SITE ne peut gérer que les terrains de son site")
    void siteAdminCanManageOnlyOwnTerrains() {
        authenticate("admin.lyon@padel.com");
        when(administrateurRepository.findByEmail("admin.lyon@padel.com"))
                .thenReturn(Optional.of(admin(TypeAdministrateur.SITE, siteLyon)));

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

    private Administrateur admin(TypeAdministrateur type, Site site) {
        return Administrateur.builder()
                .email("admin@padel.com")
                .typeAdministrateur(type)
                .site(site)
                .build();
    }
}
