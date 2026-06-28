package com.padell.padell.repository;

import com.padell.padell.entity.Match;
import com.padell.padell.entity.enums.StatutMatch;
import com.padell.padell.entity.enums.TypeMatch;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByTypeMatchAndStatut(TypeMatch type, StatutMatch statut);

    List<Match> findByTerrainSiteId(Long siteId);

    List<Match> findByOrganisateurId(Long organisateurId);

    List<Match> findByDateDebutBetweenAndStatut(LocalDateTime start, LocalDateTime end, StatutMatch statut);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Match m WHERE m.id = :id")
    Optional<Match> findByIdForUpdate(@Param("id") Long id);

    /**
     * Trouve les matchs sur un terrain donné qui chevauchent un créneau horaire spécifié,
     * en excluant un certain statut (typiquement ANNULE).
     *
     * Un chevauchement se produit si :
     * (startA < endB) et (endA > startB)
     *
     * @param terrainId L'ID du terrain.
     * @param start     La date et l'heure de début du créneau à vérifier.
     * @param end       La date et l'heure de fin du créneau à vérifier.
     * @param statut    Le statut à exclure de la recherche.
     * @return Une liste de matchs qui se chevauchent.
     */
    @Query("SELECT m FROM Match m WHERE m.terrain.id = :terrainId " +
           "AND m.statut <> :statut " +
           "AND m.dateDebut < :end " +
           "AND m.dateFin > :start")
    List<Match> findOverlappingMatches(
            @Param("terrainId") Long terrainId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("statut") StatutMatch statut
    );
}
