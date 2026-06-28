package com.padell.padell;

import com.padelPlay.entity.*;
import com.padelPlay.entity.enums.*;
import com.padelPlay.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SiteRepository siteRepository;
    private final TerrainRepository terrainRepository;
    private final MembreRepository membreRepository;
    private final AdministrateurRepository administrateurRepository;
    private final JourFermetureRepository jourFermetureRepository;
    private final MatchRepository matchRepository;
    private final ReservationRepository reservationRepository;
    private final PaiementRepository paiementRepository;
    private final PenaliteRepository penaliteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // seeding uniquement si la BDD est vide
        if (siteRepository.count() > 0) {
            if (matchRepository.count() == 0) {
                log.info("DataInitializer : database already seeded, adding sample matches...");
                seedMatchesFromExistingData();
            }
            ensurePenalizedDemoMember();
            log.info("DataInitializer : database already seeded, skipping...");
            return;
        }

        log.info("DataInitializer : seeding database...");

        // ----------------------------------------------------------------
        // Sites
        // ----------------------------------------------------------------
        Site siteLyon = siteRepository.save(Site.builder()
                .nom("Padel Club Lyon")
                .adresse("12 rue de la République, Lyon")
                .heureOuverture(LocalTime.of(8, 0))
                .heureFermeture(LocalTime.of(22, 0))
                .dureeMatchMinutes(90)
                .dureeEntreMatchMinutes(15)
                .anneeCivile(2025)
                .build());

        Site siteParis = siteRepository.save(Site.builder()
                .nom("Padel Club Paris")
                .adresse("45 avenue des Champs, Paris")
                .heureOuverture(LocalTime.of(7, 0))
                .heureFermeture(LocalTime.of(23, 0))
                .dureeMatchMinutes(90)
                .dureeEntreMatchMinutes(15)
                .anneeCivile(2025)
                .build());

        log.info("DataInitializer : {} sites created", siteRepository.count());

        // ----------------------------------------------------------------
        // Terrains
        // ----------------------------------------------------------------
        Terrain courtA = terrainRepository.save(Terrain.builder().nom("Court A").site(siteLyon).prix(60.0).build());
        Terrain courtB = terrainRepository.save(Terrain.builder().nom("Court B").site(siteLyon).prix(60.0).build());
        Terrain courtC = terrainRepository.save(Terrain.builder().nom("Court C").site(siteLyon).prix(60.0).build());

        Terrain court1 = terrainRepository.save(Terrain.builder().nom("Court 1").site(siteParis).prix(60.0).build());
        terrainRepository.save(Terrain.builder().nom("Court 2").site(siteParis).prix(60.0).build());

        log.info("DataInitializer : {} courts created", terrainRepository.count());

        // ----------------------------------------------------------------
        // Jours de fermeture
        // ----------------------------------------------------------------

        // fermeture globale (tous les sites)
        jourFermetureRepository.save(JourFermeture.builder()
                .date(LocalDate.of(2025, 12, 25))
                .raison("Christmas Day")
                .global(true)
                .site(null)
                .build());

        jourFermetureRepository.save(JourFermeture.builder()
                .date(LocalDate.of(2025, 1, 1))
                .raison("New Year's Day")
                .global(true)
                .site(null)
                .build());

        // fermeture spécifique au site Lyon
        jourFermetureRepository.save(JourFermeture.builder()
                .date(LocalDate.of(2025, 7, 14))
                .raison("Bastille Day — Lyon site maintenance")
                .global(false)
                .site(siteLyon)
                .build());

        log.info("DataInitializer : closing days created");

        // ----------------------------------------------------------------
        // Membres
        // ----------------------------------------------------------------
        Membre lucas = membreRepository.save(Membre.builder()
                .matricule("G1001")
                .nom("Martin")
                .prenom("Lucas")
                .email("lucas.martin@email.com")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .site(null)
                .build());

        Membre emma = membreRepository.save(Membre.builder()
                .matricule("G1002")
                .nom("Dubois")
                .prenom("Emma")
                .email("emma.dubois@email.com")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .site(null)
                .build());

        Membre tom = membreRepository.save(Membre.builder()
                .matricule("S10001")
                .nom("Bernard")
                .prenom("Tom")
                .email("tom.bernard@email.com")
                .typeMembre(TypeMembre.SITE)
                .solde(0.0)
                .site(siteLyon)
                .build());

        Membre sarah = membreRepository.save(Membre.builder()
                .matricule("S10002")
                .nom("Leroy")
                .prenom("Sarah")
                .email("sarah.leroy@email.com")
                .typeMembre(TypeMembre.SITE)
                .solde(0.0)
                .site(siteParis)
                .build());

        Membre alex = membreRepository.save(Membre.builder()
                .matricule("L10001")
                .nom("Petit")
                .prenom("Alex")
                .email("alex.petit@email.com")
                .typeMembre(TypeMembre.LIBRE)
                .solde(0.0)
                .site(null)
                .build());

        Membre penalise = membreRepository.save(Membre.builder()
                .matricule("L10002")
                .nom("Pénalisé")
                .prenom("Démo")
                .email("demo.penalise@email.com")
                .typeMembre(TypeMembre.LIBRE)
                .solde(0.0)
                .site(null)
                .build());

        log.info("DataInitializer : {} members created", membreRepository.count());

        seedActivePenalty(penalise);
        seedMatches(courtA, courtB, courtC, court1, lucas, emma, tom, sarah, alex);

        // ----------------------------------------------------------------
        // Administrateurs
        // ----------------------------------------------------------------
        administrateurRepository.save(Administrateur.builder()
                .matricule("ADMIN001")
                .nom("Admin")
                .prenom("Global")
                .email("admin@padel.com")
                .passwordHash(passwordEncoder.encode("Admin1234!"))
                .typeAdministrateur(TypeAdministrateur.GLOBAL)
                .site(null)
                .build());

        administrateurRepository.save(Administrateur.builder()
                .matricule("ADMIN002")
                .nom("Admin")
                .prenom("Lyon")
                .email("admin.lyon@padel.com")
                .passwordHash(passwordEncoder.encode("Admin1234!"))
                .typeAdministrateur(TypeAdministrateur.SITE)
                .site(siteLyon)
                .build());

        administrateurRepository.save(Administrateur.builder()
                .matricule("ADMIN003")
                .nom("Admin")
                .prenom("Paris")
                .email("admin.paris@padel.com")
                .passwordHash(passwordEncoder.encode("Admin1234!"))
                .typeAdministrateur(TypeAdministrateur.SITE)
                .site(siteParis)
                .build());

        log.info("DataInitializer : {} admins created", administrateurRepository.count());
        log.info("DataInitializer : seeding completed successfully !");
    }

    private void seedMatchesFromExistingData() {
        Terrain courtA = requireSeedTerrain("Court A");
        Terrain courtB = requireSeedTerrain("Court B");
        Terrain courtC = requireSeedTerrain("Court C");
        Terrain court1 = requireSeedTerrain("Court 1");

        Membre lucas = requireSeedMember("G1001");
        Membre emma = requireSeedMember("G1002");
        Membre tom = requireSeedMember("S10001");
        Membre sarah = requireSeedMember("S10002");
        Membre alex = requireSeedMember("L10001");

        seedMatches(courtA, courtB, courtC, court1, lucas, emma, tom, sarah, alex);
    }

    private Terrain requireSeedTerrain(String nom) {
        return terrainRepository.findAll().stream()
                .filter(terrain -> terrain.getNom().equals(nom))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Terrain seed introuvable : " + nom));
    }

    private Membre requireSeedMember(String matricule) {
        return membreRepository.findByMatricule(matricule)
                .orElseThrow(() -> new IllegalStateException("Membre seed introuvable : " + matricule));
    }

    private void ensurePenalizedDemoMember() {
        Membre membre = membreRepository.findByMatricule("L10002")
                .orElseGet(() -> membreRepository.save(Membre.builder()
                        .matricule("L10002")
                        .nom("Pénalisé")
                        .prenom("Démo")
                        .email("demo.penalise@email.com")
                        .typeMembre(TypeMembre.LIBRE)
                        .solde(0.0)
                        .site(null)
                        .build()));

        seedActivePenalty(membre);
    }

    private void seedActivePenalty(Membre membre) {
        if (penaliteRepository.existsByMembreIdAndDateFinAfter(membre.getId(), LocalDate.now())) {
            return;
        }

        penaliteRepository.save(Penalite.builder()
                .membre(membre)
                .dateFin(LocalDate.now().plusWeeks(1))
                .motif("Membre de démonstration pénalisé")
                .build());
    }

    private void seedMatches(
            Terrain courtA,
            Terrain courtB,
            Terrain courtC,
            Terrain court1,
            Membre lucas,
            Membre emma,
            Membre tom,
            Membre sarah,
            Membre alex
    ) {
        Match publicLyon = createSeedMatch(courtA, lucas, LocalDate.now().plusDays(2).atTime(10, 0),
                TypeMatch.PUBLIC, StatutMatch.PLANIFIE, 0);
        createSeedReservation(publicLyon, lucas, StatutReservation.EN_ATTENTE, StatutPaiement.EN_ATTENTE);

        Match privateLyon = createSeedMatch(courtB, tom, LocalDate.now().plusDays(3).atTime(14, 0),
                TypeMatch.PRIVE, StatutMatch.PLANIFIE, 1);
        createSeedReservation(privateLyon, tom, StatutReservation.CONFIRMEE, StatutPaiement.PAYE);

        Match publicParis = createSeedMatch(court1, sarah, LocalDate.now().plusDays(4).atTime(18, 0),
                TypeMatch.PUBLIC, StatutMatch.PLANIFIE, 2);
        createSeedReservation(publicParis, sarah, StatutReservation.CONFIRMEE, StatutPaiement.PAYE);
        createSeedReservation(publicParis, emma, StatutReservation.CONFIRMEE, StatutPaiement.PAYE);

        Match completeLyon = createSeedMatch(courtC, lucas, LocalDate.now().plusDays(5).atTime(16, 0),
                TypeMatch.PUBLIC, StatutMatch.COMPLET, 4);
        createSeedReservation(completeLyon, lucas, StatutReservation.CONFIRMEE, StatutPaiement.PAYE);
        createSeedReservation(completeLyon, emma, StatutReservation.CONFIRMEE, StatutPaiement.PAYE);
        createSeedReservation(completeLyon, tom, StatutReservation.CONFIRMEE, StatutPaiement.PAYE);
        createSeedReservation(completeLyon, alex, StatutReservation.CONFIRMEE, StatutPaiement.PAYE);

        log.info("DataInitializer : {} matches created", matchRepository.count());
    }

    private Match createSeedMatch(
            Terrain terrain,
            Membre organisateur,
            java.time.LocalDateTime dateDebut,
            TypeMatch typeMatch,
            StatutMatch statut,
            int nbJoueursActuels
    ) {
        return matchRepository.save(Match.builder()
                .terrain(terrain)
                .organisateur(organisateur)
                .dateDebut(dateDebut)
                .dateFin(dateDebut.plusMinutes(90))
                .typeMatch(typeMatch)
                .statut(statut)
                .nbJoueursActuels(nbJoueursActuels)
                .prixTotal(60.0)
                .prixParJoueur(15.0)
                .build());
    }

    private void createSeedReservation(
            Match match,
            Membre membre,
            StatutReservation statutReservation,
            StatutPaiement statutPaiement
    ) {
        Reservation reservation = reservationRepository.save(Reservation.builder()
                .match(match)
                .membre(membre)
                .statut(statutReservation)
                .build());

        Paiement paiement = paiementRepository.save(Paiement.builder()
                .reservation(reservation)
                .montant(match.getPrixParJoueur())
                .statut(statutPaiement)
                .datePaiement(statutPaiement == StatutPaiement.PAYE ? java.time.LocalDateTime.now() : null)
                .build());

        reservation.setPaiement(paiement);
    }
}
