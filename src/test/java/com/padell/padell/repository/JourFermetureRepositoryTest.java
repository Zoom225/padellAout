package com.padell.padell.repository;

import com.padell.padell.entity.JourFermeture;
import com.padell.padell.entity.Site;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("JourFermetureRepository tests")
class JourFermetureRepositoryTest {

    @Autowired
    private JourFermetureRepository jourFermetureRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Test
    @DisplayName("existsByDateAndGlobalTrue détecte une fermeture globale")
    void shouldFindGlobalClosingDay() {
        LocalDate date = LocalDate.of(2026, 12, 25);
        jourFermetureRepository.save(JourFermeture.builder()
                .date(date)
                .raison("Noël")
                .global(true)
                .build());

        assertThat(jourFermetureRepository.existsByDateAndGlobalTrue(date)).isTrue();
    }

    @Test
    @DisplayName("existsByDateAndSiteId détecte une fermeture de site")
    void shouldFindSiteClosingDay() {
        Site site = siteRepository.save(site());
        LocalDate date = LocalDate.of(2026, 7, 14);
        jourFermetureRepository.save(JourFermeture.builder()
                .date(date)
                .raison("Maintenance")
                .global(false)
                .site(site)
                .build());

        assertThat(jourFermetureRepository.existsByDateAndSiteId(date, site.getId())).isTrue();
    }

    private Site site() {
        return Site.builder()
                .nom("Padel Club Lyon")
                .adresse("12 rue de la République")
                .heureOuverture(LocalTime.of(8, 0))
                .heureFermeture(LocalTime.of(22, 0))
                .dureeMatchMinutes(90)
                .dureeEntreMatchMinutes(15)
                .anneeCivile(2026)
                .build();
    }
}
