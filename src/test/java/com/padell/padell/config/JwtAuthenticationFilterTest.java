package com.padell.padell.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de JwtAuthenticationFilter")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtConfig jwtConfig;

    @Mock
    private FilterChain filterChain;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Un token administrateur GLOBAL est authentifié comme ROLE_ADMIN")
    void adminTokenIsAuthenticatedAsAdminRole() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtConfig);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer admin-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtConfig.isTokenValid("admin-token")).thenReturn(true);
        when(jwtConfig.extractSubject("admin-token")).thenReturn("admin@padel.com");
        when(jwtConfig.extractRole("admin-token")).thenReturn("GLOBAL");
        when(jwtConfig.extractPrincipalType("admin-token")).thenReturn("ADMIN");

        filter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getName()).isEqualTo("admin@padel.com");
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_ADMIN");

        verify(filterChain).doFilter(request, response);
    }
}
