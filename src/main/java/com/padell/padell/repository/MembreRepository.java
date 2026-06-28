package com.padell.padell.repository;

import com.padelPlay.entity.Membre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembreRepository extends JpaRepository<Membre, Long> {
    Optional<Membre> findByMatricule(String matricule);
    boolean existsByMatricule(String matricule);
    boolean existsByEmail(String email);
}
