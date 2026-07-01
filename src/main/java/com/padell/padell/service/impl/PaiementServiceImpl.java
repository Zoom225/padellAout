package com.padell.padell.service.impl;

import com.padell.padell.entity.Match;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Paiement;
import com.padell.padell.entity.Reservation;
import com.padell.padell.entity.enums.StatutPaiement;
import com.padell.padell.entity.enums.StatutReservation;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.exception.ResourceNotFoundException;
import com.padell.padell.repository.MatchRepository;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.repository.PaiementRepository;
import com.padell.padell.service.PaiementService;
import com.padell.padell.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {

    private final PaiementRepository paiementRepository;
    private final ReservationService reservationService;
    private final MembreRepository membreRepository;
    private final MatchRepository matchRepository;

    @Override
    @Transactional
    public Paiement pay(Long reservationId, Long membreId) {
        Reservation reservation = reservationService.getById(reservationId);
        Membre membre = reservation.getMembre();

        // Regle metier : seul le membre lie a la reservation peut payer.
        if (!membre.getId().equals(membreId)) {
            throw new BusinessException("Seul le membre associé à cette réservation peut payer.");
        }

        // Regle metier : une reservation annulee ne peut pas etre payee.
        if (reservation.getStatut() == com.padell.padell.entity.enums.StatutReservation.ANNULEE) {
            throw new BusinessException("Impossible de payer une réservation annulée.");
        }

        Paiement paiement = reservation.getPaiement();
        if (paiement == null) {
            throw new ResourceNotFoundException("Aucun paiement trouvé pour la réservation : " + reservationId);
        }

        // Regle metier : un paiement deja effectue ne peut pas etre refait.
        if (paiement.getStatut() == StatutPaiement.PAYE) {
            throw new BusinessException("Le paiement de cette réservation a déjà été effectué.");
        }

        // Regle metier : un paiement annule ne peut pas etre relance.
        if (paiement.getStatut() == StatutPaiement.ANNULE) {
            throw new BusinessException("Le paiement de cette réservation a été annulé.");
        }

        // Regle metier : le verrou evite deux paiements sur la derniere place disponible.
        Match match = matchRepository.findByIdForUpdate(reservation.getMatch().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Match introuvable avec l'ID : " + reservation.getMatch().getId()));
        // Regle metier : seules les reservations en attente peuvent etre payees.
        if (reservation.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations en attente peuvent être payées.");
        }
        // Regle metier : impossible de payer si le match est deja complet.
        if (match.getNbJoueursActuels() >= 4) {
            throw new BusinessException("Le match est déjà complet. La place n'est plus disponible.");
        }

        double montantFinal = paiement.getMontant();
        if (membre.getSolde() > 0.0) {
            // Regle metier : un solde impaye est recupere au paiement suivant.
            montantFinal += membre.getSolde();
            log.info("Solde impayé de {} ajouté au paiement du membre {}",
                    membre.getSolde(), membreId);
            membre.setSolde(0.0);
            membreRepository.save(membre);
        }

        paiement.setMontant(montantFinal);
        paiement.setStatut(StatutPaiement.PAYE);
        paiement.setDatePaiement(LocalDateTime.now());
        paiementRepository.save(paiement);

        reservationService.confirm(reservationId);

        log.info("Paiement effectué pour la réservation {} par le membre {}", reservationId, membreId);

        return paiement;
    }

    @Override
    public Paiement getById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable avec l'ID : " + id));
    }

    @Override
    public Paiement getByReservationId(Long reservationId) {
        return paiementRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable pour la réservation : " + reservationId));
    }

    @Override
    public List<Paiement> getByMembreId(Long membreId) {
        return paiementRepository.findByReservationMembreId(membreId);
    }

    @Override
    public void checkPaiementOwner(Long paiementId, Long membreId) {
        Paiement paiement = getById(paiementId);
        // Regle metier : un membre ne peut consulter que ses propres paiements.
        if (!paiement.getReservation().getMembre().getId().equals(membreId)) {
            throw new BusinessException("Accès refusé : ce paiement appartient à un autre membre.");
        }
    }

    @Override
    public void checkReservationPaiementOwner(Long reservationId, Long membreId) {
        Paiement paiement = getByReservationId(reservationId);
        // Regle metier : un membre ne peut agir que sur le paiement de sa reservation.
        if (!paiement.getReservation().getMembre().getId().equals(membreId)) {
            throw new BusinessException("Accès refusé : ce paiement appartient à un autre membre.");
        }
    }

    @Override
    @Transactional
    public void checkUnpaidBeforeMatch() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Regle metier : a J-1, les reservations non payees sont annulees et imputees a l'organisateur.
        paiementRepository.findByStatut(StatutPaiement.EN_ATTENTE)
                .stream()
                .filter(p -> p.getReservation().getMatch()
                        .getDateDebut().toLocalDate().equals(tomorrow))
                .forEach(p -> {
                    Reservation reservation = p.getReservation();
                    Match match = reservation.getMatch();

                    reservationService.cancel(reservation.getId());

                    double partManquante = match.getPrixParJoueur();
                    Membre organisateur = match.getOrganisateur();
                    organisateur.setSolde(organisateur.getSolde() + partManquante);
                    membreRepository.save(organisateur);

                    log.info("Réservation impayée {} annulée, solde {} ajouté à l'organisateur {}",
                            reservation.getId(), partManquante, organisateur.getId());
                });
    }
}
