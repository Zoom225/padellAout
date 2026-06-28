package com.padell.padell.repository;

import com.padelPlay.entity.Match;
import com.padelPlay.entity.Membre;
import com.padelPlay.entity.Site;
import com.padelPlay.entity.Terrain;
import com.padelPlay.entity.enums.StatutMatch;
import com.padelPlay.entity.enums.TypeMatch;
import com.padelPlay.entity.enums.TypeMembre;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("MatchRepository tests")
class MatchRepositoryTest {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private TerrainRepository terrainRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Test
    @DisplayName("findOverlappingMatches retourne les matchs planifiés qui chevauchent le créneau")
    void shouldFindOverlappingMatches() {
        Terrain terrain = terrainRepository.save(Terrain.builder()
                .nom("Court A")
                .site(siteRepository.save(site()))
                .prix(60.0)
                .build());
        Membre organisateur = membreRepository.save(membre("G1001"));

        LocalDateTime start = LocalDateTime.of(2026, 7, 10, 10, 0);
        matchRepository.save(match(terrain, organisateur, start, StatutMatch.PLANIFIE));

        assertThat(matchRepository.findOverlappingMatches(
                terrain.getId(),
                start.plusMinutes(30),
                start.plusMinutes(120),
                StatutMatch.ANNULE
        )).hasSize(1);
    }

    @Test
    @DisplayName("findOverlappingMatches ignore les matchs annulés")
    void shouldIgnoreCancelledMatches() {
        Terrain terrain = terrainRepository.save(Terrain.builder()
                .nom("Court A")
                .site(siteRepository.save(site()))
                .prix(60.0)
                .build());
        Membre organisateur = membreRepository.save(membre("G1001"));

        LocalDateTime start = LocalDateTime.of(2026, 7, 10, 10, 0);
        matchRepository.save(match(terrain, organisateur, start, StatutMatch.ANNULE));

        assertThat(matchRepository.findOverlappingMatches(
                terrain.getId(),
                start.plusMinutes(30),
                start.plusMinutes(120),
                StatutMatch.ANNULE
        )).isEmpty();
    }

    private Site site() {
        return Site.builder()
                .nom("Padel Club Lyon")
                .adresse("12 rue de la République")
                .heureOuverture(LocalTime.of(8, 0))
                .heureFermeture(LocalTime.of(22, 0))
                .dureeMatchMinutes(90)
                .dureeEntreMatchMinutes(15)
                .anneeCivile(2026)
                .build();
    }

    private Membre membre(String matricule) {
        return Membre.builder()
                .matricule(matricule)
                .nom("Martin")
                .prenom("Lucas")
                .email(matricule.toLowerCase() + "@example.com")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .build();
    }

    private Match match(Terrain terrain, Membre organisateur, LocalDateTime start, StatutMatch statut) {
        return Match.builder()
                .terrain(terrain)
                .organisateur(organisateur)
                .dateDebut(start)
                .dateFin(start.plusMinutes(90))
                .typeMatch(TypeMatch.PUBLIC)
                .statut(statut)
                .nbJoueursActuels(1)
                .prixTotal(60.0)
                .prixParJoueur(15.0)
                .build();
    }
}
