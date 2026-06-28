package com.padell.padell.repository;

import com.padell.padell.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByMatchId(Long matchId);
    List<Reservation> findByMembreId(Long membreId);
    boolean existsByMatchIdAndMembreId(Long matchId, Long membreId);
}
