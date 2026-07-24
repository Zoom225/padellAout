package com.padell.padell.service;

import com.padell.padell.entity.*;
import com.padell.padell.entity.enums.*;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.exception.ResourceNotFoundException;
import com.padell.padell.repository.PaiementRepository;
import com.padell.padell.repository.ReservationRepository;
import com.padell.padell.service.impl.ReservationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de ReservationService")
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PaiementRepository paiementRepository;

    @Mock
    private MatchService matchService;

    @Mock
    private MembreService membreService;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    private Site site;
    private Site siteB;
    private Terrain terrain;
    private Membre organisateur;
    private Membre joueur;
    private Membre joueurSiteB;
    private Match matchPrive;
    private Match matchPublic;
    private Match matchComplet;

    @BeforeEach
    void setUp() {
        siteB = Site.builder()
                .nom("Padel Club Paris")
                .build();
        siteB.setId(2L);

        site = Site.builder()
                .nom("Padel Club Lyon")
                .build();
        site.setId(1L);

        terrain = Terrain.builder()
                .nom("Court A")
                .site(site)
                .build();
        terrain.setId(1L);

        organisateur = Membre.builder()
                .matricule("G1001")
                .nom("Martin")
                .prenom("Lucas")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .site(null)
                .build();
        organisateur.setId(1L);

        joueur = Membre.builder()
                .matricule("G1002")
                .nom("Dupont")
                .prenom("Julie")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .site(null)
                .build();
        joueur.setId(2L);

        // membre rattaché à un autre site → ne peut pas réserver sur siteLyon
        joueurSiteB = Membre.builder()
                .matricule("S20001")
                .nom("Leclerc")
                .prenom("Paul")
                .typeMembre(TypeMembre.SITE)
                .solde(0.0)
                .site(siteB)
                .build();
        joueurSiteB.setId(3L);

        matchPrive = Match.builder()
                .terrain(terrain)
                .organisateur(organisateur)
                .dateDebut(java.time.LocalDateTime.of(LocalDate.now().plusDays(25), LocalTime.of(15, 0)))
                .dateFin(java.time.LocalDateTime.of(LocalDate.now().plusDays(25), LocalTime.of(16, 30)))
                .typeMatch(TypeMatch.PRIVE)
                .statut(StatutMatch.PLANIFIE)
                .nbJoueursActuels(1)
                .prixTotal(60.0)
                .prixParJoueur(15.0)
                .build();
        matchPrive.setId(10L);

        matchPublic = Match.builder()
                .terrain(terrain)
                .organisateur(organisateur)
                .dateDebut(java.time.LocalDateTime.of(LocalDate.now().plusDays(25), LocalTime.of(17, 0)))
                .dateFin(java.time.LocalDateTime.of(LocalDate.now().plusDays(25), LocalTime.of(18, 30)))
                .typeMatch(TypeMatch.PUBLIC)
                .statut(StatutMatch.PLANIFIE)
                .nbJoueursActuels(1)
                .prixTotal(60.0)
                .prixParJoueur(15.0)
                .build();
        matchPublic.setId(11L);

        matchComplet = Match.builder()
                .terrain(terrain)
                .organisateur(organisateur)
                .dateDebut(java.time.LocalDateTime.of(LocalDate.now().plusDays(25), LocalTime.of(19, 0)))
                .dateFin(java.time.LocalDateTime.of(LocalDate.now().plusDays(25), LocalTime.of(20, 30)))
                .typeMatch(TypeMatch.PUBLIC)
                .statut(StatutMatch.COMPLET)
                .nbJoueursActuels(4)
                .prixTotal(60.0)
                .prixParJoueur(15.0)
                .build();
        matchComplet.setId(12L);
    }

    // ================================================================
    // CREATE
    // ================================================================
    @Nested
    @DisplayName("create()")
    class CreateTests {

        @Test
        @DisplayName("✅ doit créer une réservation pour un match PUBLIC avec un membre valide")
        void shouldCreateReservationForPublicMatch() {
            when(matchService.getMatchEntityById(11L)).thenReturn(matchPublic); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);
            when(membreService.hasActivePenalty(2L)).thenReturn(false);
            when(membreService.hasOutstandingBalance(2L)).thenReturn(false);
            when(reservationRepository.existsByMatchIdAndMembreId(11L, 2L)).thenReturn(false);
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(paiementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Reservation result = reservationService.create(11L, 2L, 2L);

            assertThat(result).isNotNull();
            assertThat(result.getStatut()).isEqualTo(StatutReservation.EN_ATTENTE);
            assertThat(result.getMembre()).isEqualTo(joueur);
            assertThat(result.getMatch()).isEqualTo(matchPublic);

            // vérifier que le paiement EN_ATTENTE est créé automatiquement
            verify(paiementRepository, times(1)).save(argThat(paiement ->
                    paiement.getMontant().equals(15.0) &&
                            paiement.getStatut() == StatutPaiement.EN_ATTENTE
            ));
            verify(matchService).incrementPlayers(11L);
        }

        @Test
        @DisplayName("✅ doit créer une réservation pour un match PRIVE quand l'organisateur ajoute un joueur")
        void shouldCreateReservationForPriveMatchByOrganizer() {
            when(matchService.getMatchEntityById(10L)).thenReturn(matchPrive); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);
            when(membreService.hasActivePenalty(2L)).thenReturn(false);
            when(membreService.hasOutstandingBalance(2L)).thenReturn(false);
            when(reservationRepository.existsByMatchIdAndMembreId(10L, 2L)).thenReturn(false);
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(paiementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // l'organisateur (id=1) ajoute joueur (id=2) → autorisé
            Reservation result = reservationService.create(10L, 2L, 1L);

            assertThat(result).isNotNull();
            assertThat(result.getStatut()).isEqualTo(StatutReservation.EN_ATTENTE);
            verify(matchService).incrementPlayers(10L);
        }

        @Test
        @DisplayName("✅ doit créer des réservations à partir de matricules invités")
        void shouldCreateReservationsForInvites() {
            when(matchService.getMatchEntityById(10L)).thenReturn(matchPrive);
            when(membreService.getByMatricule("g1002")).thenReturn(joueur);
            when(membreService.getById(2L)).thenReturn(joueur);
            when(membreService.hasActivePenalty(2L)).thenReturn(false);
            when(membreService.hasOutstandingBalance(2L)).thenReturn(false);
            when(reservationRepository.existsByMatchIdAndMembreId(10L, 2L)).thenReturn(false);
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(paiementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            var result = reservationService.createForInvites(10L, 1L, java.util.List.of("g1002"));

            assertThat(result.size()).isEqualTo(1);
            verify(membreService).getByMatricule("g1002");
            verify(matchService).incrementPlayers(10L);
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand le match est COMPLET")
        void shouldThrowWhenMatchIsFull() {
            when(matchService.getMatchEntityById(12L)).thenReturn(matchComplet); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);

            assertThatThrownBy(() -> reservationService.create(12L, 2L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("déjà complet");

            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand le match est ANNULE")
        void shouldThrowWhenMatchIsCancelled() {
            matchPublic.setStatut(StatutMatch.ANNULE);
            when(matchService.getMatchEntityById(11L)).thenReturn(matchPublic); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);

            assertThatThrownBy(() -> reservationService.create(11L, 2L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("annulé");

            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand le membre est déjà inscrit au match")
        void shouldThrowWhenMemberAlreadyRegistered() {
            when(matchService.getMatchEntityById(11L)).thenReturn(matchPublic); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);
            when(reservationRepository.existsByMatchIdAndMembreId(11L, 2L)).thenReturn(true);

            assertThatThrownBy(() -> reservationService.create(11L, 2L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("déjà inscrit");

            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand le membre a une pénalité active")
        void shouldThrowWhenMemberHasActivePenalty() {
            when(matchService.getMatchEntityById(11L)).thenReturn(matchPublic); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);
            when(reservationRepository.existsByMatchIdAndMembreId(11L, 2L)).thenReturn(false);
            when(membreService.hasActivePenalty(2L)).thenReturn(true);

            assertThatThrownBy(() -> reservationService.create(11L, 2L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("pénalité active");

            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand le membre a un solde impayé")
        void shouldThrowWhenMemberHasOutstandingBalance() {
            when(matchService.getMatchEntityById(11L)).thenReturn(matchPublic); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);
            when(reservationRepository.existsByMatchIdAndMembreId(11L, 2L)).thenReturn(false);
            when(membreService.hasActivePenalty(2L)).thenReturn(false);
            when(membreService.hasOutstandingBalance(2L)).thenReturn(true);

            assertThatThrownBy(() -> reservationService.create(11L, 2L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("solde impayé");

            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand un non-organisateur tente de rejoindre un match PRIVE")
        void shouldThrowWhenNonOrganizerJoinsPriveMatch() {
            // joueur (id=2) essaie de rejoindre directement un match privé
            // sans passer par l'organisateur (id=1)
            when(matchService.getMatchEntityById(10L)).thenReturn(matchPrive); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);
            when(reservationRepository.existsByMatchIdAndMembreId(10L, 2L)).thenReturn(false);
            when(membreService.hasActivePenalty(2L)).thenReturn(false);
            when(membreService.hasOutstandingBalance(2L)).thenReturn(false);

            assertThatThrownBy(() -> reservationService.create(10L, 2L, 2L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("seul l'organisateur");

            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand un membre SITE réserve sur le mauvais site")
        void shouldThrowWhenSiteMemberBooksOnWrongSite() {
            // joueurSiteB est rattaché à Paris → ne peut pas réserver sur Lyon
            when(matchService.getMatchEntityById(11L)).thenReturn(matchPublic); // MODIFIÉ
            when(membreService.getById(3L)).thenReturn(joueurSiteB);
            when(reservationRepository.existsByMatchIdAndMembreId(11L, 3L)).thenReturn(false);
            when(membreService.hasActivePenalty(3L)).thenReturn(false);
            when(membreService.hasOutstandingBalance(3L)).thenReturn(false);

            assertThatThrownBy(() -> reservationService.create(11L, 3L, 3L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("propre site");

            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("✅ paiement créé avec le montant correct = prixParJoueur du match")
        void shouldCreatePaiementWithCorrectAmount() {
            when(matchService.getMatchEntityById(11L)).thenReturn(matchPublic); // MODIFIÉ
            when(membreService.getById(2L)).thenReturn(joueur);
            when(reservationRepository.existsByMatchIdAndMembreId(11L, 2L)).thenReturn(false);
            when(membreService.hasActivePenalty(2L)).thenReturn(false);
            when(membreService.hasOutstandingBalance(2L)).thenReturn(false);
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(paiementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            reservationService.create(11L, 2L, 2L);

            // prixParJoueur = 60€ / 4 = 15€
            verify(paiementRepository).save(argThat(p ->
                    p.getMontant().equals(15.0) &&
                            p.getStatut() == StatutPaiement.EN_ATTENTE
            ));
            verify(matchService).incrementPlayers(11L);
        }
    }

    // ================================================================
    // CANCEL
    // ================================================================
    @Nested
    @DisplayName("cancel()")
    class CancelTests {

        @Test
        @DisplayName("✅ doit annuler la réservation en attente et décrémenter le nombre de joueurs")
        void shouldCancelReservation() {
            Paiement paiement = Paiement.builder()
                    .montant(15.0)
                    .statut(StatutPaiement.EN_ATTENTE)
                    .build();

            Reservation reservation = Reservation.builder()
                    .match(matchPublic)
                    .membre(joueur)
                    .statut(StatutReservation.EN_ATTENTE)
                    .paiement(paiement)
                    .build();
            reservation.setId(1L);

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            reservationService.cancel(1L);

            assertThat(reservation.getStatut()).isEqualTo(StatutReservation.ANNULEE);
            verify(matchService).decrementPlayers(matchPublic.getId());
        }

        @Test
        @DisplayName("✅ doit rembourser le paiement quand la réservation est annulée après paiement")
        void shouldRefundPaymentWhenCancelledAfterPayment() {
            Paiement paiement = Paiement.builder()
                    .montant(15.0)
                    .statut(StatutPaiement.PAYE) // déjà payé
                    .build();

            Reservation reservation = Reservation.builder()
                    .match(matchPublic)
                    .membre(joueur)
                    .statut(StatutReservation.CONFIRMEE)
                    .paiement(paiement)
                    .build();
            reservation.setId(1L);

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            reservationService.cancel(1L);

            // paiement doit passer à REMBOURSE
            assertThat(paiement.getStatut()).isEqualTo(StatutPaiement.REMBOURSE);
            verify(paiementRepository, times(1)).save(paiement);
            verify(matchService, times(1)).decrementPlayers(matchPublic.getId());
        }

        @Test
        @DisplayName("✅ doit annuler le paiement quand la réservation est annulée avant paiement")
        void shouldCancelPaymentWhenNotYetPaid() {
            Paiement paiement = Paiement.builder()
                    .montant(15.0)
                    .statut(StatutPaiement.EN_ATTENTE) // pas encore payé
                    .build();

            Reservation reservation = Reservation.builder()
                    .match(matchPublic)
                    .membre(joueur)
                    .statut(StatutReservation.EN_ATTENTE)
                    .paiement(paiement)
                    .build();
            reservation.setId(1L);

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            reservationService.cancel(1L);

            // paiement passe à ANNULE — réservation annulée avant paiement
            assertThat(paiement.getStatut()).isEqualTo(StatutPaiement.ANNULE);
            verify(paiementRepository, times(1)).save(paiement);
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand la réservation est déjà annulée")
        void shouldThrowWhenAlreadyCancelled() {
            Reservation reservation = Reservation.builder()
                    .match(matchPublic)
                    .membre(joueur)
                    .statut(StatutReservation.ANNULEE)
                    .build();
            reservation.setId(1L);

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

            assertThatThrownBy(() -> reservationService.cancel(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("déjà annulée");

            verify(matchService, never()).decrementPlayers(any());
        }

        @Test
        @DisplayName("❌ doit lever une ResourceNotFoundException quand la réservation n'est pas trouvée")
        void shouldThrowWhenReservationNotFound() {
            when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.cancel(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Réservation introuvable");
        }
    }

    // ================================================================
    // CONFIRM
    // ================================================================
    @Nested
    @DisplayName("confirm()")
    class ConfirmTests {

        @Test
        @DisplayName("✅ doit confirmer la réservation sans incrémenter à nouveau les joueurs du match")
        void shouldConfirmReservation() {
            Reservation reservation = Reservation.builder()
                    .match(matchPublic)
                    .membre(joueur)
                    .statut(StatutReservation.EN_ATTENTE)
                    .build();
            reservation.setId(1L);

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            reservationService.confirm(1L);

            assertThat(reservation.getStatut()).isEqualTo(StatutReservation.CONFIRMEE);
            verify(matchService, never()).incrementPlayers(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand la réservation est déjà confirmée")
        void shouldThrowWhenAlreadyConfirmed() {
            Reservation reservation = Reservation.builder()
                    .match(matchPublic)
                    .membre(joueur)
                    .statut(StatutReservation.CONFIRMEE)
                    .build();
            reservation.setId(1L);

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

            assertThatThrownBy(() -> reservationService.confirm(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("déjà confirmée");

            verify(matchService, never()).incrementPlayers(any());
        }
    }

    // ================================================================
    // GET
    // ================================================================
    @Nested
    @DisplayName("getById()")
    class GetTests {

        @Test
        @DisplayName("✅ doit retourner la réservation quand l'id existe")
        void shouldReturnReservationById() {
            Reservation reservation = Reservation.builder()
                    .match(matchPublic)
                    .membre(joueur)
                    .statut(StatutReservation.EN_ATTENTE)
                    .build();
            reservation.setId(1L);

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

            Reservation result = reservationService.getById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getStatut()).isEqualTo(StatutReservation.EN_ATTENTE);
        }

        @Test
        @DisplayName("❌ doit lever une ResourceNotFoundException quand l'id n'est pas trouvé")
        void shouldThrowWhenReservationNotFound() {
            when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.getById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Réservation introuvable");
        }
    }
}
