package com.padell.padell.service;

import com.padell.padell.entity.Paiement;

import java.util.List;

public interface PaiementService {
    Paiement pay(Long reservationId, Long membreId);
    Paiement getById(Long id);
    Paiement getByReservationId(Long reservationId);
    List<Paiement> getByMembreId(Long membreId);
    void checkPaiementOwner(Long paiementId, Long membreId);
    void checkReservationPaiementOwner(Long reservationId, Long membreId);
    void checkUnpaidBeforeMatch();
}
