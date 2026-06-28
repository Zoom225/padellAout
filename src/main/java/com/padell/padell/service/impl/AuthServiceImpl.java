package com.padell.padell.service.impl;

import com.padell.padell.config.JwtConfig;
import com.padell.padell.dto.request.LoginRequest;
import com.padell.padell.dto.response.LoginResponse;
import com.padell.padell.entity.Administrateur;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AdministrateurRepository administrateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    @Override
    public LoginResponse login(LoginRequest request) {
        // chercher l'admin par email
        Administrateur admin = administrateurRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Identifiants invalides."));

        // vérifier le password
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new BusinessException("Identifiants invalides.");
        }

        // générer le token JWT
        String token = jwtConfig.generateToken(
                admin.getEmail(),
                admin.getTypeAdministrateur().name()
        );

        log.info("Administrateur {} connecté avec succès", admin.getEmail());

        return LoginResponse.builder()
                .token(token)
                .email(admin.getEmail())
                .nom(admin.getNom())
                .prenom(admin.getPrenom())
                .role(admin.getTypeAdministrateur())
                .siteId(admin.getSite() != null ? admin.getSite().getId() : null)
                .build();
    }
}
