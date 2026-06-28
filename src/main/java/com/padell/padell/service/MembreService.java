package com.padell.padell.service;

import com.padell.padell.entity.Membre;

import java.util.List;

public interface MembreService {
    Membre create(Membre membre);
    Membre getById(Long id);
    Membre getByMatricule(String matricule);
    List<Membre> getAll();
    Membre update(Long id, Membre membre);
    void delete(Long id);
    boolean hasActivePenalty(Long membreId);
    boolean hasOutstandingBalance(Long membreId);
    void addPenalty(Long membreId);
}
