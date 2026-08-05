package com.padell.padell;

import com.padell.padell.entity.Administrateur;
import com.padell.padell.entity.JourFermeture;
import com.padell.padell.entity.Match;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Paiement;
import com.padell.padell.entity.Penalite;
import com.padell.padell.entity.Reservation;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.Terrain;
import com.padell.padell.entity.enums.StatutMatch;
import com.padell.padell.entity.enums.StatutPaiement;
import com.padell.padell.entity.enums.StatutReservation;
import com.padell.padell.entity.enums.TypeAdministrateur;
import com.padell.padell.entity.enums.TypeMatch;
import com.padell.padell.entity.enums.TypeMembre;
import com.padell.padell.repository.AdministrateurRepository;
import com.padell.padell.repository.JourFermetureRepository;
import com.padell.padell.repository.MatchRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.repository.PaiementRepository;
import com.padell.padell.repository.PenaliteRepository;
import com.padell.padell.repository.ReservationRepository;
import com.padell.padell.repository.SiteRepository;
import com.padell.padell.repository.TerrainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String DEMO_MEMBER_PASSWORD = "Membre1234!";
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
        migrateLegacyMemberCredentials();

        if (siteRepository.count() > 0) {
            if (matchRepository.count() == 0) {
                log.info("DataInitializer : base de donnees deja initialisee, ajout des matchs d'exemple...");
                seedMatchesFromExistingData();
            }
            ensurePenalizedDemoMember();
            ensureDemoMembersCredentials();
            ensureDemoAdminCredentials();
            log.info("DataInitializer : base de donnees deja initialisee, initialisation ignoree...");
            return;
        }

        log.info("DataInitializer : initialisation de la base de donnees...");

        Site siteLyon = siteRepository.save(Site.builder()
                .nom("Padel Club Lyon")
                .adresse("12 rue de la Republique, Lyon")
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

        log.info("DataInitializer : {} sites crees", siteRepository.count());
////-------------------Terrains--------------------//
        Terrain courtA = terrainRepository.save(Terrain.builder().nom("Court A").site(siteLyon).prix(60.0).build());
        Terrain courtB = terrainRepository.save(Terrain.builder().nom("Court B").site(siteLyon).prix(60.0).build());
        Terrain courtC = terrainRepository.save(Terrain.builder().nom("Court C").site(siteLyon).prix(60.0).build());
        Terrain court1 = terrainRepository.save(Terrain.builder().nom("Court 1").site(siteParis).prix(60.0).build());
        terrainRepository.save(Terrain.builder().nom("Court 2").site(siteParis).prix(60.0).build());

        log.info("DataInitializer : {} terrains crees", terrainRepository.count());
//-----------------------Jours de fermeture--------------------//
        jourFermetureRepository.save(JourFermeture.builder()
                .date(LocalDate.of(2025, 12, 25))
                .raison("Jour de Noel")
                .global(true)
                .site(null)
                .build());

        jourFermetureRepository.save(JourFermeture.builder()
                .date(LocalDate.of(2025, 1, 1))
                .raison("Jour de l'An")
                .global(true)
                .site(null)
                .build());

        jourFermetureRepository.save(JourFermeture.builder()
                .date(LocalDate.of(2025, 7, 14))
                .raison("Fete nationale - maintenance du site de Lyon")
                .global(false)
                .site(siteLyon)
                .build());

        log.info("DataInitializer : jours de fermeture crees");
//-----------------------Membres--------------------//
        String defaultMemberPasswordHash = passwordEncoder.encode(DEMO_MEMBER_PASSWORD);

        Membre lucas = membreRepository.save(Membre.builder()
                .matricule("G1001")
                .nom("Martin")
                .prenom("Lucas")
                .email("lucas.martin@gmail.com")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .site(null)
                .passwordHash(defaultMemberPasswordHash)
                .build());

        Membre emma = membreRepository.save(Membre.builder()
                .matricule("G1002")
                .nom("Dubois")
                .prenom("Emma")
                .email("emma.dubois@gmail.com")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .site(null)
                .passwordHash(defaultMemberPasswordHash)
                .build());

        Membre tom = membreRepository.save(Membre.builder()
                .matricule("S10001")
                .nom("Bernard")
                .prenom("Tom")
                .email("tom.bernard@gmail.com")
                .typeMembre(TypeMembre.SITE)
                .solde(0.0)
                .site(siteLyon)
                .passwordHash(defaultMemberPasswordHash)
                .build());

        Membre sarah = membreRepository.save(Membre.builder()
                .matricule("S10002")
                .nom("Leroy")
                .prenom("Sarah")
                .email("sarah.leroy@gmail.com")
                .typeMembre(TypeMembre.SITE)
                .solde(0.0)
                .site(siteParis)
                .passwordHash(defaultMemberPasswordHash)
                .build());

        Membre alex = membreRepository.save(Membre.builder()
                .matricule("L10001")
                .nom("Petit")
                .prenom("Alex")
                .email("alex.petit@gmail.com")
                .typeMembre(TypeMembre.LIBRE)
                .solde(0.0)
                .site(null)
                .passwordHash(defaultMemberPasswordHash)
                .build());

        Membre penalise = membreRepository.save(Membre.builder()
                .matricule("L10002")
                .nom("Penalise")
                .prenom("Demo")
                .email("demo.penalise@gmail.com")
                .typeMembre(TypeMembre.LIBRE)
                .solde(0.0)
                .site(null)
                .passwordHash(defaultMemberPasswordHash)
                .build());

        log.info("DataInitializer : {} membres crees", membreRepository.count());

        seedActivePenalty(penalise);
        seedMatches(courtA, courtB, courtC, court1, lucas, emma, tom, sarah, alex);
//-----------------------Administrateurs--------------------//
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

        log.info("DataInitializer : {} administrateurs crees", administrateurRepository.count());
        log.info("DataInitializer : initialisation terminee avec succes !");
    }

    private void migrateLegacyMemberCredentials() {
        List<Membre> legacyMembers = membreRepository.findAll().stream()
                .filter(member -> !StringUtils.hasText(member.getPasswordHash()))
                .toList();

        if (legacyMembers.isEmpty()) {
            return;
        }

        legacyMembers.forEach(member -> member.setPasswordHash(passwordEncoder.encode(DEMO_MEMBER_PASSWORD)));
        membreRepository.saveAll(legacyMembers);

        log.warn("DataInitializer : {} compte(s) membre legacy ont recu le mot de passe par defaut", legacyMembers.size());
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
        return membreRepository.findByMatriculeIgnoreCase(matricule)
                .orElseThrow(() -> new IllegalStateException("Membre seed introuvable : " + matricule));
    }

    private void ensurePenalizedDemoMember() {
        Membre membre = membreRepository.findByMatriculeIgnoreCase("L10002")
                .orElseGet(() -> membreRepository.save(Membre.builder()
                        .matricule("L10002")
                        .nom("Penalise")
                        .prenom("Demo")
                        .email("demo.penalise@gmail.com")
                        .typeMembre(TypeMembre.LIBRE)
                        .solde(0.0)
                        .site(null)
                        .passwordHash(passwordEncoder.encode(DEMO_MEMBER_PASSWORD))
                        .build()));

        seedActivePenalty(membre);
    }

    private void ensureDemoMembersCredentials() {
        updateDemoMemberCredentials("G1001", "lucas.martin@gmail.com");
        updateDemoMemberCredentials("G1002", "emma.dubois@gmail.com");
        updateDemoMemberCredentials("S10001", "tom.bernard@gmail.com");
        updateDemoMemberCredentials("S10002", "sarah.leroy@gmail.com");
        updateDemoMemberCredentials("L10001", "alex.petit@gmail.com");
        updateDemoMemberCredentials("L10002", "demo.penalise@gmail.com");
    }

    private void updateDemoMemberCredentials(String matricule, String email) {
        membreRepository.findByMatriculeIgnoreCase(matricule).ifPresent(membre -> {
            membre.setEmail(email);
            membre.setPasswordHash(passwordEncoder.encode(DEMO_MEMBER_PASSWORD));
            membreRepository.save(membre);
        });
    }

    private void ensureDemoAdminCredentials() {
        updateDemoAdminCredentials("admin@padel.com");
        updateDemoAdminCredentials("admin.lyon@padel.com");
        updateDemoAdminCredentials("admin.paris@padel.com");
    }

    private void updateDemoAdminCredentials(String email) {
        administrateurRepository.findByEmail(email).ifPresent(admin -> {
            admin.setPasswordHash(passwordEncoder.encode("Admin1234!"));
            administrateurRepository.save(admin);
        });
    }

    private void seedActivePenalty(Membre membre) {
        if (penaliteRepository.existsByMembreIdAndDateFinAfter(membre.getId(), LocalDate.now())) {
            return;
        }

        penaliteRepository.save(Penalite.builder()
                .membre(membre)
                .dateFin(LocalDate.now().plusWeeks(1))
                .motif("Membre de demonstration penalise")
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

        log.info("DataInitializer : {} matchs crees", matchRepository.count());
    }

    private Match createSeedMatch(
            Terrain terrain,
            Membre organisateur,
            LocalDateTime dateDebut,
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
                .datePaiement(statutPaiement == StatutPaiement.PAYE ? LocalDateTime.now() : null)
                .build());

        reservation.setPaiement(paiement);
    }
}
