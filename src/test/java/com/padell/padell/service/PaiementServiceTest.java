package com.padell.padell.service;

import com.padelPlay.entity.*;
import com.padelPlay.entity.enums.*;
import com.padelPlay.exception.BusinessException;
import com.padelPlay.exception.ResourceNotFoundException;
import com.padelPlay.repository.MatchRepository;
import com.padelPlay.repository.MembreRepository;
import com.padelPlay.repository.PaiementRepository;
import com.padelPlay.service.impl.PaiementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaiementService tests")
class PaiementServiceTest {

    @Mock
    private PaiementRepository paiementRepository;

    @Mock
    private ReservationService reservationService;

    @Mock
    private MembreRepository membreRepository;

    @Mock
    private MatchRepository matchRepository;

    @InjectMocks
    private PaiementServiceImpl paiementService;

    private Site site;
    private Terrain terrain;
    private Membre organisateur;
    private Membre joueur;
    private Match match;
    private Reservation reservation;
    private Paiement paiement;

    @BeforeEach
    void setUp() {
        site = Site.builder().nom("Padel Club Lyon").build();
        terrain = Terrain.builder().nom("Court A").site(site).build();

        organisateur = Membre.builder()
                .matricule("G1001").nom("Martin").prenom("Lucas")
                .typeMembre(TypeMembre.GLOBAL).solde(0.0).build();
        organisateur.setId(1L);

        joueur = Membre.builder()
                .matricule("G1002").nom("Dupont").prenom("Julie")
                .typeMembre(TypeMembre.GLOBAL).solde(0.0).build();
        joueur.setId(2L);

        // Correction : Utiliser uniquement dateDebut et dateFin
        LocalDateTime matchStart = LocalDate.now().plusDays(25).atTime(15, 0);
        match = Match.builder()
                .terrain(terrain)
                .organisateur(organisateur)
                .dateDebut(matchStart)
                .dateFin(matchStart.plusMinutes(90))
                .typeMatch(TypeMatch.PUBLIC)
                .statut(StatutMatch.PLANIFIE)
                .nbJoueursActuels(1)
                .prixTotal(60.0)
                .prixParJoueur(15.0)
                .build();
        match.setId(10L);

        reservation = Reservation.builder()
                .match(match).membre(joueur).statut(StatutReservation.EN_ATTENTE).build();
        reservation.setId(1L);

        paiement = Paiement.builder()
                .reservation(reservation).montant(15.0).statut(StatutPaiement.EN_ATTENTE).build();
        paiement.setId(1L);

        reservation.setPaiement(paiement);
    }

    @Nested
    @DisplayName("pay()")
    class PayTests {
        @Test
        @DisplayName("✅ should process payment and confirm reservation")
        void shouldProcessPayment() {
            when(reservationService.getById(1L)).thenReturn(reservation);
            when(matchRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(match));
            when(paiementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Paiement result = paiementService.pay(1L, 2L);

            assertThat(result.getStatut()).isEqualTo(StatutPaiement.PAYE);
            verify(reservationService).confirm(1L);
        }

        @Test
        @DisplayName("✅ should add outstanding balance and clear it")
        void shouldAddOutstandingBalanceToPayment() {
            joueur.setSolde(15.0);
            when(reservationService.getById(1L)).thenReturn(reservation);
            when(matchRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(match));
            when(membreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(paiementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Paiement result = paiementService.pay(1L, 2L);

            assertThat(result.getMontant()).isEqualTo(30.0);
            assertThat(joueur.getSolde()).isEqualTo(0.0);
            verify(membreRepository).save(joueur);
        }

        @Test
        @DisplayName("❌ should throw when already paid")
        void shouldThrowWhenAlreadyPaid() {
            paiement.setStatut(StatutPaiement.PAYE);
            when(reservationService.getById(1L)).thenReturn(reservation);

            assertThatThrownBy(() -> paiementService.pay(1L, 2L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("déjà été effectué");
        }

        @Test
        @DisplayName("❌ should throw when match is already full at payment time")
        void shouldThrowWhenMatchIsFullAtPaymentTime() {
            match.setNbJoueursActuels(4);
            when(reservationService.getById(1L)).thenReturn(reservation);
            when(matchRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(match));

            assertThatThrownBy(() -> paiementService.pay(1L, 2L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("déjà complet");
        }
    }

    @Nested
    @DisplayName("getById() and getByReservationId()")
    class GetTests {
        @Test
        @DisplayName("✅ should return payment when id exists")
        void shouldReturnPaymentById() {
            when(paiementRepository.findById(1L)).thenReturn(Optional.of(paiement));
            Paiement result = paiementService.getById(1L);
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("❌ should throw when payment id not found")
        void shouldThrowWhenPaymentNotFound() {
            when(paiementRepository.findById(99L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> paiementService.getById(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("checkUnpaidBeforeMatch()")
    class SchedulerTests {
        @Test
        @DisplayName("✅ should cancel unpaid reservation and add balance")
        void shouldCancelUnpaidReservationAndAddBalanceToOrganizer() {
            // Correction : Utiliser setDateDebut pour modifier la date du match
            LocalDateTime tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay();
            match.setDateDebut(tomorrowStart);

            when(paiementRepository.findByStatut(StatutPaiement.EN_ATTENTE)).thenReturn(List.of(paiement));
            when(membreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            paiementService.checkUnpaidBeforeMatch();

            verify(reservationService).cancel(reservation.getId());
            assertThat(organisateur.getSolde()).isEqualTo(15.0);
            verify(membreRepository).save(organisateur);
        }

        @Test
        @DisplayName("✅ should NOT cancel when match is not tomorrow")
        void shouldNotCancelWhenMatchIsNotTomorrow() {
            // Correction : S'assurer que la date du match n'est pas demain
            match.setDateDebut(LocalDate.now().plusDays(5).atStartOfDay());

            when(paiementRepository.findByStatut(StatutPaiement.EN_ATTENTE)).thenReturn(List.of(paiement));

            paiementService.checkUnpaidBeforeMatch();

            verify(reservationService, never()).cancel(any());
            verify(membreRepository, never()).save(any());
        }
    }
}
