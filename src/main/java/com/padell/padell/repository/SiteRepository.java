package com.padell.padell.repository;

import com.padell.padell.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    // Correction : Suppression de toutes les méthodes personnalisées.
    // La méthode standard findAll() héritée de JpaRepository est maintenant sûre
    // à utiliser grâce au chargement LAZY des collections dans l'entité Site.
    // Si un chargement spécifique est nécessaire à l'avenir, il faudra utiliser
    // @EntityGraph sur une nouvelle méthode avec un nom non conflictuel.
}
