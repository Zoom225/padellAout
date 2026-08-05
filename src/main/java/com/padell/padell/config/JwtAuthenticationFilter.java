package com.padell.padell.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtConfig jwtConfig;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtConfig.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String subject = jwtConfig.extractSubject(token);
        String grantedRole = normalizeRole(jwtConfig.extractRole(token), jwtConfig.extractPrincipalType(token));

        if (!StringUtils.hasText(grantedRole)) {
            log.warn("JWT missing or unsupported role for subject {}", subject);
            filterChain.doFilter(request, response);
            return;
        }

        authenticate(subject, grantedRole);
        log.debug("Subject {} authenticated with role {}", subject, grantedRole);

        filterChain.doFilter(request, response);
    }

    private void authenticate(String principal, String grantedRole) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of(new SimpleGrantedAuthority(grantedRole))
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String normalizeRole(String role, String principalType) {
        if (StringUtils.hasText(principalType)) {
            String normalizedPrincipalType = principalType.trim().toUpperCase(Locale.ROOT);
            if ("ADMIN".equals(normalizedPrincipalType)) {
                return "ROLE_ADMIN";
            }
            if ("MEMBER".equals(normalizedPrincipalType)) {
                return "ROLE_MEMBER";
            }
        }

        if (!StringUtils.hasText(role)) {
            return null;
        }

        String normalizedRole = role.trim().toUpperCase(Locale.ROOT);
        if ("ADMIN".equals(normalizedRole) || "MEMBER".equals(normalizedRole)) {
            normalizedRole = "ROLE_" + normalizedRole;
        }

        return switch (normalizedRole) {
            case "ROLE_ADMIN", "ROLE_MEMBER" -> normalizedRole;
            default -> null;
        };
    }
}
