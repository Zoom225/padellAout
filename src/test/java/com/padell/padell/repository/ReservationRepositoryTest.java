package com.padell.padell.repository;

import com.padelPlay.entity.*;
import com.padelPlay.entity.enums.StatutMatch;
import com.padelPlay.entity.enums.StatutReservation;
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
@DisplayName("ReservationRepository tests")
class ReservationRepositoryTest {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private TerrainRepository terrainRepository;

    @Test
    @DisplayName("existsByMatchIdAndMembreId détecte un membre déjà inscrit")
    void shouldFindExistingReservationForMemberAndMatch() {
        Site site = siteRepository.save(site());
        Terrain terrain = terrainRepository.save(Terrain.builder().nom("Court A").site(site).prix(60.0).build());
        Membre organisateur = membreRepository.save(membre("G1001"));
        Membre joueur = membreRepository.save(membre("G1002"));
        Match match = matchRepository.save(match(terrain, organisateur));

        reservationRepository.save(Reservation.builder()
                .match(match)
                .membre(joueur)
                .statut(StatutReservation.EN_ATTENTE)
                .build());

        assertThat(reservationRepository.existsByMatchIdAndMembreId(match.getId(), joueur.getId())).isTrue();
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

    private Match match(Terrain terrain, Membre organisateur) {
        LocalDateTime start = LocalDateTime.of(2026, 7, 10, 10, 0);
        return Match.builder()
                .terrain(terrain)
                .organisateur(organisateur)
                .dateDebut(start)
                .dateFin(start.plusMinutes(90))
                .typeMatch(TypeMatch.PUBLIC)
                .statut(StatutMatch.PLANIFIE)
                .nbJoueursActuels(1)
                .prixTotal(60.0)
                .prixParJoueur(15.0)
                .build();
    }
}
