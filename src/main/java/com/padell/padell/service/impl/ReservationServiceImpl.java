package com.padell.padell.service.impl;

import com.padell.padell.entity.Match;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Paiement;
import com.padell.padell.entity.Reservation;
import com.padell.padell.entity.enums.*;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.exception.ResourceNotFoundException;
import com.padell.padell.repository.PaiementRepository;
import com.padell.padell.repository.ReservationRepository;
import com.padell.padell.service.MatchService;
import com.padell.padell.service.MembreService;
import com.padell.padell.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final PaiementRepository paiementRepository;
    private final MatchService matchService;
    private final MembreService membreService;

    @Override
    @Transactional
    public Reservation create(Long matchId, Long membreId, Long requesterId) {
        Match match = matchService.getMatchEntityById(matchId);
        Membre membre = membreService.getById(membreId);

        // Regle metier : impossible de reserver un match deja complet.
        if (match.getStatut() == StatutMatch.COMPLET) {
            throw new BusinessException("Le match est déjà complet.");
        }
        // Regle metier : impossible de reserver un match annule.
        if (match.getStatut() == StatutMatch.ANNULE) {
            throw new BusinessException("Le match est annulé.");
        }

        // Regle metier : un membre ne peut pas etre inscrit deux fois au meme match.
        if (reservationRepository.existsByMatchIdAndMembreId(matchId, membreId)) {
            throw new BusinessException("Ce membre est déjà inscrit à ce match.");
        }

        // Regle metier : un membre penalise ne peut pas reserver.
        if (membreService.hasActivePenalty(membreId)) {
            throw new BusinessException("Vous avez une pénalité active et ne pouvez pas réserver ce match.");
        }

        // Regle metier : un membre avec un solde impaye ne peut pas reserver.
        if (membreService.hasOutstandingBalance(membreId)) {
            throw new BusinessException("Vous avez un solde impayé et ne pouvez pas réserver ce match.");
        }

        // Le requesterId est l'ID de la personne qui initie la demande de réservation.
        // Regle metier : seul l'organisateur peut inviter des joueurs sur un match prive.
        if (match.getTypeMatch() == TypeMatch.PRIVE
                && !match.getOrganisateur().getId().equals(requesterId)) {
            throw new BusinessException("Pour un match privé, seul l'organisateur peut ajouter des joueurs.");
        }

        // Regle metier : un membre reserve un match public uniquement pour lui-meme.
        if (match.getTypeMatch() == TypeMatch.PUBLIC && !membreId.equals(requesterId)) {
            throw new BusinessException("Un membre ne peut réserver un match public que pour lui-même.");
        }

        if (membre.getTypeMembre() == TypeMembre.SITE) {
            Long membreSiteId = membre.getSite().getId();
            Long matchSiteId = match.getTerrain().getSite().getId();
            // Regle metier : un membre SITE ne reserve que sur son site.
            if (!membreSiteId.equals(matchSiteId)) {
                throw new BusinessException("Un membre SITE ne peut réserver que sur son propre site.");
            }
        }

        Reservation reservation = Reservation.builder()
                .match(match)
                .membre(membre)
                .statut(StatutReservation.EN_ATTENTE)
                .build();

        reservation = reservationRepository.save(reservation);

        // Regle metier : chaque reservation cree automatiquement un paiement en attente.
        Paiement paiement = Paiement.builder()
                .reservation(reservation)
                .montant(match.getPrixParJoueur())
                .statut(StatutPaiement.EN_ATTENTE)
                .build();

        paiement = paiementRepository.save(paiement);
        reservation.setPaiement(paiement);

        log.info("Réservation créée pour le membre {} sur le match {}", membreId, matchId);

        return reservation;
    }

    @Override
    public Reservation getById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable avec l'ID : " + id));
    }

    @Override
    public List<Reservation> getByMatchId(Long matchId) {
        return reservationRepository.findByMatchId(matchId);
    }

    @Override
    public List<Reservation> getByMembreId(Long membreId) {
        return reservationRepository.findByMembreId(membreId);
    }

    @Override
    public void checkReservationOwner(Long reservationId, Long membreId) {
        Reservation reservation = getById(reservationId);
        // Regle metier : un membre ne peut consulter que ses propres reservations.
        if (!reservation.getMembre().getId().equals(membreId)) {
            throw new BusinessException("Accès refusé : cette réservation appartient à un autre membre.");
        }
    }

    @Override
    @Transactional
    public void cancel(Long reservationId) {
        Reservation reservation = getById(reservationId);
        boolean wasConfirmed = reservation.getStatut() == StatutReservation.CONFIRMEE;

        // Regle metier : impossible d'annuler deux fois la meme reservation.
        if (reservation.getStatut() == StatutReservation.ANNULEE) {
            throw new BusinessException("La réservation est déjà annulée.");
        }

        reservation.setStatut(StatutReservation.ANNULEE);
        reservationRepository.save(reservation);

        // Regle metier : annuler une reservation met aussi a jour son paiement.
        Paiement paiement = reservation.getPaiement();
        if (paiement != null) {
            if (paiement.getStatut() == StatutPaiement.PAYE) {
                paiement.setStatut(StatutPaiement.REMBOURSE);
            } else if (paiement.getStatut() == StatutPaiement.EN_ATTENTE) {
                paiement.setStatut(StatutPaiement.ANNULE);
            }
            paiementRepository.save(paiement);
        }

        if (wasConfirmed) {
            matchService.decrementPlayers(reservation.getMatch().getId());
        }

        log.info("Réservation {} annulée", reservationId);
    }

    @Override
    @Transactional
    public void confirm(Long reservationId) {
        Reservation reservation = getById(reservationId);

        // Regle metier : impossible de confirmer deux fois la meme reservation.
        if (reservation.getStatut() == StatutReservation.CONFIRMEE) {
            throw new BusinessException("La réservation est déjà confirmée.");
        }

        reservation.setStatut(StatutReservation.CONFIRMEE);
        reservationRepository.save(reservation);

        // Regle metier : confirmer une reservation occupe une place dans le match.
        matchService.incrementPlayers(reservation.getMatch().getId());

        log.info("Réservation {} confirmée", reservationId);
    }
}
