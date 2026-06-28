package com.padell.padell.service.impl;

import com.padelPlay.entity.Match;
import com.padelPlay.entity.Membre;
import com.padelPlay.entity.Paiement;
import com.padelPlay.entity.Reservation;
import com.padelPlay.entity.enums.StatutPaiement;
import com.padelPlay.entity.enums.StatutReservation;
import com.padelPlay.exception.BusinessException;
import com.padelPlay.exception.ResourceNotFoundException;
import com.padelPlay.repository.MatchRepository;
import com.padelPlay.repository.MembreRepository;
import com.padelPlay.repository.PaiementRepository;
import com.padelPlay.service.PaiementService;
import com.padelPlay.service.ReservationService;
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

        // règle : seul le membre concerné peut payer
        if (!membre.getId().equals(membreId)) {
            throw new BusinessException("Seul le membre associé à cette réservation peut payer.");
        }

        // règle : impossible de payer une réservation annulée
        if (reservation.getStatut() == com.padelPlay.entity.enums.StatutReservation.ANNULEE) {
            throw new BusinessException("Impossible de payer une réservation annulée.");
        }

        Paiement paiement = reservation.getPaiement();
        if (paiement == null) {
            throw new ResourceNotFoundException("Aucun paiement trouvé pour la réservation : " + reservationId);
        }

        if (paiement.getStatut() == StatutPaiement.PAYE) {
            throw new BusinessException("Le paiement de cette réservation a déjà été effectué.");
        }

        if (paiement.getStatut() == StatutPaiement.ANNULE) {
            throw new BusinessException("Le paiement de cette réservation a été annulé.");
        }

        Match match = matchRepository.findByIdForUpdate(reservation.getMatch().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Match introuvable avec l'ID : " + reservation.getMatch().getId()));
        if (reservation.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations en attente peuvent être payées.");
        }
        if (match.getNbJoueursActuels() >= 4) {
            throw new BusinessException("Le match est déjà complet. La place n'est plus disponible.");
        }

        // règle : si solde dû, on l'ajoute au montant
        double montantFinal = paiement.getMontant();
        if (membre.getSolde() > 0.0) {
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

        // confirmer la réservation après paiement
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
        if (!paiement.getReservation().getMembre().getId().equals(membreId)) {
            throw new BusinessException("Accès refusé : ce paiement appartient à un autre membre.");
        }
    }

    @Override
    public void checkReservationPaiementOwner(Long reservationId, Long membreId) {
        Paiement paiement = getByReservationId(reservationId);
        if (!paiement.getReservation().getMembre().getId().equals(membreId)) {
            throw new BusinessException("Accès refusé : ce paiement appartient à un autre membre.");
        }
    }

    @Override
    @Transactional
    public void checkUnpaidBeforeMatch() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // récupérer toutes les réservations EN_ATTENTE pour les matchs de demain
        paiementRepository.findByStatut(StatutPaiement.EN_ATTENTE)
                .stream()
                // Correction : Utiliser getDateDebut().toLocalDate() au lieu de getDate()
                .filter(p -> p.getReservation().getMatch()
                        .getDateDebut().toLocalDate().equals(tomorrow))
                .forEach(p -> {
                    Reservation reservation = p.getReservation();
                    Match match = reservation.getMatch();

                    // annuler la réservation non payée
                    reservationService.cancel(reservation.getId());

                    // ajouter le solde dû à l'organisateur si match public non complet
                    double partManquante = match.getPrixParJoueur();
                    Membre organisateur = match.getOrganisateur();
                    organisateur.setSolde(organisateur.getSolde() + partManquante);
                    membreRepository.save(organisateur);

                    log.info("Réservation impayée {} annulée, solde {} ajouté à l'organisateur {}",
                            reservation.getId(), partManquante, organisateur.getId());
                });
    }
}
