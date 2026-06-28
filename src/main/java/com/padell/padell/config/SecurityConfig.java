package com.padell.padell.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/sites/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/terrains/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/membres/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/matches/public").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/matches").hasRole("MEMBER")
                        .requestMatchers(HttpMethod.GET, "/api/matches/organisateur/**").hasRole("MEMBER")
                        .requestMatchers(HttpMethod.GET, "/api/matches").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/matches/site/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/matches/*").hasAnyRole("MEMBER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/matches/*").hasRole("MEMBER")
                        .requestMatchers(HttpMethod.PATCH, "/api/matches/*/cancel").hasRole("MEMBER")
                        .requestMatchers(HttpMethod.PATCH, "/api/matches/*/convert-public").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/reservations/membre/**").hasRole("MEMBER")
                        .requestMatchers(HttpMethod.GET, "/api/reservations/match/**").hasAnyRole("MEMBER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reservations/*").hasAnyRole("MEMBER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reservations").hasRole("MEMBER")
                        .requestMatchers(HttpMethod.PATCH, "/api/reservations/*/cancel").hasRole("MEMBER")

                        .requestMatchers("/api/paiements/**").hasRole("MEMBER")

                        .requestMatchers(HttpMethod.GET, "/api/membres").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/membres/matricule/**").hasAnyRole("MEMBER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/membres/*/penalty").hasAnyRole("MEMBER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/membres/*/balance").hasAnyRole("MEMBER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/membres/*").hasAnyRole("MEMBER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/membres").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/membres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/membres/**").hasRole("ADMIN")
                        .requestMatchers("/api/jours-fermeture/**").hasRole("ADMIN")

                        .anyRequest().hasRole("ADMIN")
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
