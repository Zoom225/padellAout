package com.padell.padell.service.impl;

import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Penalite;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.enums.TypeMembre;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.exception.ResourceNotFoundException;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.repository.PenaliteRepository;
import com.padell.padell.service.MembreService;
import com.padell.padell.service.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MembreServiceImpl implements MembreService {

    private static final String DEFAULT_MEMBER_PASSWORD = "Membre1234!";

    private final MembreRepository membreRepository;
    private final PenaliteRepository penaliteRepository;
    private final SiteService siteService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Membre create(Membre membre, Long siteId, String rawPassword) {
        prepareForCreation(membre, siteId, rawPassword);
        return create(membre);
    }

    @Override
    public Membre prepareForCreation(Membre membre, Long siteId, String rawPassword) {
        if (siteId != null) {
            Site site = siteService.getById(siteId);
            membre.setSite(site);
        }

        String password = StringUtils.hasText(rawPassword) ? rawPassword : DEFAULT_MEMBER_PASSWORD;
        membre.setPasswordHash(passwordEncoder.encode(password));
        return membre;
    }

    @Override
    public Membre create(Membre membre) {
        membre.setMatricule(normalizeMatricule(membre.getMatricule()));
        validateMatricule(membre.getMatricule(), membre.getTypeMembre());

        // Regle metier : le matricule doit etre unique.
        if (membreRepository.existsByMatricule(membre.getMatricule())) {
            throw new BusinessException("Le matricule existe déjà : " + membre.getMatricule());
        }
        // Regle metier : l'email doit etre unique lorsqu'il est renseigne.
        if (membre.getEmail() != null && membreRepository.existsByEmail(membre.getEmail())) {
            throw new BusinessException("L'email existe déjà : " + membre.getEmail());
        }
        // Regle metier : un membre SITE doit etre rattache a un site.
        if (membre.getTypeMembre() == TypeMembre.SITE && membre.getSite() == null) {
            throw new BusinessException("Un membre SITE doit être lié à un site.");
        }

        membre.setSolde(0.0);
        return membreRepository.save(membre);
    }

    @Override
    public Membre getById(Long id) {
        return membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre introuvable avec l'ID : " + id));
    }

    @Override
    public Membre getByMatricule(String matricule) {
        String normalizedMatricule = normalizeMatricule(matricule);
        return membreRepository.findByMatriculeIgnoreCase(normalizedMatricule)
                .orElseThrow(() -> new ResourceNotFoundException("Membre introuvable avec le matricule : " + normalizedMatricule));
    }

    @Override
    public List<Membre> getAll() {
        return membreRepository.findAll();
    }

    @Override
    public Membre update(Long id, Membre membre) {
        Membre existing = getById(id);
        existing.setNom(membre.getNom());
        existing.setPrenom(membre.getPrenom());
        existing.setEmail(membre.getEmail());
        return membreRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        Membre existing = getById(id);
        membreRepository.delete(existing);
    }

    @Override
    public boolean hasActivePenalty(Long membreId) {
        return penaliteRepository.existsByMembreIdAndDateFinAfter(membreId, LocalDate.now());
    }

    @Override
    public boolean hasOutstandingBalance(Long membreId) {
        Membre membre = getById(membreId);
        return membre.getSolde() > 0.0;
    }
    @Override
    public void addPenalty(Long membreId) {
        Membre membre = getById(membreId);
        Penalite penalite = Penalite.builder()
                .membre(membre)
                .dateFin(LocalDate.now().plusWeeks(1))
                .motif("Match privé incomplet avant l'échéance")
                .build();
        penaliteRepository.save(penalite);
    }

    @Override
    public Membre authenticate(String matricule, String password) {
        String normalizedMatricule = normalizeMatricule(matricule);
        Membre membre = membreRepository.findByMatriculeIgnoreCase(normalizedMatricule)
                .orElseThrow(() -> new BusinessException("Identifiants invalides."));

        if (!StringUtils.hasText(password)
                || !StringUtils.hasText(membre.getPasswordHash())
                || !passwordEncoder.matches(password, membre.getPasswordHash())) {
            throw new BusinessException("Identifiants invalides.");
        }

        return membre;
    }

    private String normalizeMatricule(String matricule) {
        return matricule == null ? "" : matricule.trim().toUpperCase(Locale.ROOT);
    }

    private void validateMatricule(String matricule, TypeMembre type) {
        boolean valid = switch (type) {
            case GLOBAL -> matricule.matches("^G\\d{4}$");
            case SITE   -> matricule.matches("^S\\d{5}$");
            case LIBRE  -> matricule.matches("^L\\d{5}$");
        };
        // Regle metier : un matricule doit respecter le format du type de membre.
        if (!valid) {
            throw new BusinessException("Format de matricule invalide pour le type " + type + " : " + matricule);
        }
    }
}
