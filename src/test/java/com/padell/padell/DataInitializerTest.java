package com.padell.padell;

import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.enums.TypeMembre;
import com.padell.padell.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock private SiteRepository siteRepository;
    @Mock private TerrainRepository terrainRepository;
    @Mock private MembreRepository membreRepository;
    @Mock private AdministrateurRepository administrateurRepository;
    @Mock private JourFermetureRepository jourFermetureRepository;
    @Mock private MatchRepository matchRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private PaiementRepository paiementRepository;
    @Mock private PenaliteRepository penaliteRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DataInitializer dataInitializer;

    @Test
    void run_shouldBackfillLegacyMemberPasswordHashes() {
        Membre legacyMember = Membre.builder()
                .matricule("g1001")
                .nom("Martin")
                .prenom("Lucas")
                .email("lucas@email.com")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .passwordHash(null)
                .build();

        Membre penalizedMember = Membre.builder()
                .matricule("L10002")
                .nom("Penalise")
                .prenom("Demo")
                .email("demo@email.com")
                .typeMembre(TypeMembre.LIBRE)
                .solde(0.0)
                .passwordHash("existing-hash")
                .build();
        penalizedMember.setId(2L);

        when(siteRepository.count()).thenReturn(1L);
        when(matchRepository.count()).thenReturn(1L);
        when(membreRepository.findAll()).thenReturn(List.of(legacyMember, penalizedMember));
        when(passwordEncoder.encode("Membre1234!")).thenReturn("hashed-default-password");
        when(membreRepository.findByMatriculeIgnoreCase("L10002")).thenReturn(Optional.of(penalizedMember));
        when(penaliteRepository.existsByMembreIdAndDateFinAfter(eq(2L), any(LocalDate.class))).thenReturn(true);

        dataInitializer.run();

        ArgumentCaptor<List<Membre>> captor = ArgumentCaptor.forClass(List.class);
        verify(membreRepository).saveAll(captor.capture());
        assertThat(captor.getValue())
                .extracting(Membre::getPasswordHash)
                .contains("hashed-default-password");
        assertThat(legacyMember.getPasswordHash()).isEqualTo("hashed-default-password");
    }
}
