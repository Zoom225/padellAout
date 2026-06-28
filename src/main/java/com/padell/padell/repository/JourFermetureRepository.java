package com.padell.padell.repository;

import com.padelPlay.entity.JourFermeture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JourFermetureRepository extends JpaRepository<JourFermeture, Long> {

    boolean existsByDateAndGlobalTrue(LocalDate date);

    boolean existsByDateAndSiteId(LocalDate date, Long siteId);

    List<JourFermeture> findByGlobalTrue();

    List<JourFermeture> findBySiteId(Long siteId);
}
