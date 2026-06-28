package com.padell.padell.service;

import com.padell.padell.entity.Reservation;

import java.util.List;

public interface ReservationService {
    Reservation create(Long matchId, Long membreId, Long requesterId);
    Reservation getById(Long id);
    List<Reservation> getByMatchId(Long matchId);
    List<Reservation> getByMembreId(Long membreId);
    void checkReservationOwner(Long reservationId, Long membreId);
    void cancel(Long reservationId);
    void confirm(Long reservationId);
}
