package com.padell.padell.service;

import com.padell.padell.entity.Membre;

import java.util.List;

public interface MembreService {
    Membre create(Membre membre);
    Membre create(Membre membre, Long siteId, String rawPassword);
    Membre prepareForCreation(Membre membre, Long siteId, String rawPassword);
    Membre getById(Long id);
    Membre getByMatricule(String matricule);
    List<Membre> getAll();
    Membre update(Long id, Membre membre);
    void delete(Long id);
    boolean hasActivePenalty(Long membreId);
    boolean hasOutstandingBalance(Long membreId);
    void addPenalty(Long membreId);
    Membre authenticate(String matricule, String password);
}
