package com.padell.padell.service;

import com.padell.padell.entity.Membre;
import com.padell.padell.service.impl.AdminAuthorizationService;
import com.padell.padell.service.impl.CurrentMemberService;
import com.padell.padell.service.impl.MembreAccessService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de MembreAccessService")
class MembreAccessServiceTest {

    @Mock
    private AdminAuthorizationService adminAuthorizationService;

    @Mock
    private CurrentMemberService currentMemberService;

    @InjectMocks
    private MembreAccessService membreAccessService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Un administrateur délègue l'accès lecture au service admin")
    void adminReadAccessDelegatesToAdminAuthorization() {
        authenticate("admin@padel.com", "ROLE_ADMIN");
        Membre membre = new Membre();
        membre.setId(12L);

        membreAccessService.assertCanRead(membre);

        verify(adminAuthorizationService).checkMembreAccess(membre);
        verifyNoInteractions(currentMemberService);
    }

    @Test
    @DisplayName("Un membre délègue l'accès lecture à son propre contrôle")
    void memberReadAccessDelegatesToCurrentMemberCheck() {
        authenticate("S10001", "ROLE_MEMBER");
        Membre membre = new Membre();
        membre.setId(7L);

        membreAccessService.assertCanRead(membre);

        verify(currentMemberService).requireCurrentMember(7L);
        verifyNoInteractions(adminAuthorizationService);
    }

    @Test
    @DisplayName("La création d'un membre passe par la vérification admin")
    void createAccessDelegatesToAdminAuthorization() {
        authenticate("admin@padel.com", "ROLE_ADMIN");

        membreAccessService.assertCanCreate(3L);

        verify(adminAuthorizationService).checkMembreAccess(3L);
        verifyNoInteractions(currentMemberService);
    }

    @Test
    @DisplayName("La liste des membres est filtrée par le service admin")
    void filterMembersDelegatesToAdminAuthorization() {
        authenticate("admin@padel.com", "ROLE_ADMIN");
        Membre membre = new Membre();
        membre.setId(1L);
        List<Membre> membres = List.of(membre);

        membreAccessService.filterMembres(membres);

        verify(adminAuthorizationService).filterMembres(membres);
        verifyNoInteractions(currentMemberService);
    }

    private void authenticate(String name, String authority) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        name,
                        null,
                        List.of(new SimpleGrantedAuthority(authority))
                )
        );
    }
}
