package com.padell.padell.service.impl;

import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Penalite;
import com.padell.padell.entity.enums.TypeMembre;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.exception.ResourceNotFoundException;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.repository.PenaliteRepository;
import com.padell.padell.service.MembreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MembreServiceImpl implements MembreService {

    private final MembreRepository membreRepository;
    private final PenaliteRepository penaliteRepository;

    @Override
    public Membre create(Membre membre) {
        // Règle métier: Valider le format du matricule en fonction du type de membre.
        validateMatricule(membre.getMatricule(), membre.getTypeMembre());

        // Règle métier: Le matricule doit être unique.
        if (membreRepository.existsByMatricule(membre.getMatricule())) {
            throw new BusinessException("Le matricule existe déjà : " + membre.getMatricule());
        }
        // Règle métier: L'email doit être unique s'il est fourni.
        if (membre.getEmail() != null && membreRepository.existsByEmail(membre.getEmail())) {
            throw new BusinessException("L'email existe déjà : " + membre.getEmail());
        }
        // Règle métier: Un membre de type SITE doit être lié à un site.
        if (membre.getTypeMembre() == TypeMembre.SITE && membre.getSite() == null) {
            throw new BusinessException("Un membre SITE doit être lié à un site.");
        }

        membre.setSolde(0.0); // Règle métier: Le solde initial d'un nouveau membre est 0.0.
        return membreRepository.save(membre);
    }

    @Override
    public Membre getById(Long id) {
        // Règle métier: Le membre doit exister pour être récupéré par ID.
        return membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre introuvable avec l'ID : " + id));
    }

    @Override
    public Membre getByMatricule(String matricule) {
        // Règle métier: Le membre doit exister pour être récupéré par matricule.
        return membreRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Membre introuvable avec le matricule : " + matricule));
    }

    @Override
    public List<Membre> getAll() {
        return membreRepository.findAll();
    }

    @Override
    public Membre update(Long id, Membre membre) {
        // Règle métier: Le membre à mettre à jour doit exister.
        Membre existing = getById(id);
        existing.setNom(membre.getNom());
        existing.setPrenom(membre.getPrenom());
        existing.setEmail(membre.getEmail());
        return membreRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        // Règle métier: Le membre à supprimer doit exister.
        Membre existing = getById(id);
        membreRepository.delete(existing);
    }

    @Override
    public boolean hasActivePenalty(Long membreId) {
        // Règle métier: Vérifie si le membre a une pénalité active (date de fin après aujourd'hui).
        return penaliteRepository.existsByMembreIdAndDateFinAfter(membreId, LocalDate.now());
    }

    @Override
    public boolean hasOutstandingBalance(Long membreId) {
        // Règle métier: Vérifie si le membre a un solde impayé (solde > 0).
        Membre membre = getById(membreId); // Règle métier: Le membre doit exister pour vérifier son solde.
        return membre.getSolde() > 0.0;
    }

    @Override
    public void addPenalty(Long membreId) {
        // Règle métier: Le membre doit exister pour lui ajouter une pénalité.
        Membre membre = getById(membreId);
        // Règle métier: Une pénalité dure une semaine à partir d'aujourd'hui.
        Penalite penalite = Penalite.builder()
                .membre(membre)
                .dateFin(LocalDate.now().plusWeeks(1))
                .motif("Match privé incomplet avant l'échéance")
                .build();
        penaliteRepository.save(penalite);
    }

    private void validateMatricule(String matricule, TypeMembre type) {
        // Règle métier: Le format du matricule doit correspondre au type de membre (Gxxxx, Sxxxxx, Lxxxxx).
        boolean valid = switch (type) {
            case GLOBAL -> matricule.matches("^G\\d{4}$");
            case SITE   -> matricule.matches("^S\\d{5}$");
            case LIBRE  -> matricule.matches("^L\\d{5}$");
        };
        if (!valid) {
            throw new BusinessException("Format de matricule invalide pour le type " + type + " : " + matricule);
        }
    }
}