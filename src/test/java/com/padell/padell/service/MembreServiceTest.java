package com.padell.padell.service;

import com.padelPlay.entity.Membre;
import com.padelPlay.entity.Site;
import com.padelPlay.entity.enums.TypeMembre;
import com.padelPlay.exception.BusinessException;
import com.padelPlay.exception.ResourceNotFoundException;
import com.padelPlay.repository.MembreRepository;
import com.padelPlay.repository.PenaliteRepository;
import com.padelPlay.service.impl.MembreServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MembreService tests")
class MembreServiceTest {

    @Mock
    private MembreRepository membreRepository;

    @Mock
    private PenaliteRepository penaliteRepository;

    @InjectMocks
    private MembreServiceImpl membreService;

    private Membre membreGlobal;
    private Membre membreSite;
    private Membre membreLibre;
    private Site site;

    @BeforeEach
    void setUp() {
        site = Site.builder()
                .nom("Padel Club Lyon")
                .build();
        site.setId(1L); // pas de setter via Builder car id vient de BaseEntity

        membreGlobal = Membre.builder()
                .matricule("G1001")
                .nom("Martin")
                .prenom("Lucas")
                .email("lucas@email.com")
                .typeMembre(TypeMembre.GLOBAL)
                .solde(0.0)
                .build();

        membreSite = Membre.builder()
                .matricule("S10001")
                .nom("Bernard")
                .prenom("Tom")
                .email("tom@email.com")
                .typeMembre(TypeMembre.SITE)
                .solde(0.0)
                .site(site)
                .build();

        membreLibre = Membre.builder()
                .matricule("L10001")
                .nom("Petit")
                .prenom("Alex")
                .email("alex@email.com")
                .typeMembre(TypeMembre.LIBRE)
                .solde(0.0)
                .build();
    }

    // ================================================================
    // CREATE
    // ================================================================
    @Nested
    @DisplayName("create()")
    class CreateTests {

        @Test
        @DisplayName("✅ should create a GLOBAL member with valid matricule G1001")
        void shouldCreateGlobalMember() {
            when(membreRepository.existsByMatricule("G1001")).thenReturn(false);
            when(membreRepository.existsByEmail(anyString())).thenReturn(false);
            when(membreRepository.save(any())).thenReturn(membreGlobal);

            Membre result = membreService.create(membreGlobal);

            assertThat(result).isNotNull();
            assertThat(result.getMatricule()).isEqualTo("G1001");
            assertThat(result.getTypeMembre()).isEqualTo(TypeMembre.GLOBAL);
            assertThat(result.getSolde()).isEqualTo(0.0);
            verify(membreRepository, times(1)).save(membreGlobal);
        }

        @Test
        @DisplayName("✅ should create a SITE member linked to a site")
        void shouldCreateSiteMember() {
            when(membreRepository.existsByMatricule("S10001")).thenReturn(false);
            when(membreRepository.existsByEmail(anyString())).thenReturn(false);
            when(membreRepository.save(any())).thenReturn(membreSite);

            Membre result = membreService.create(membreSite);

            assertThat(result.getTypeMembre()).isEqualTo(TypeMembre.SITE);
            assertThat(result.getSite()).isNotNull();
            assertThat(result.getSite().getNom()).isEqualTo("Padel Club Lyon");
        }

        @Test
        @DisplayName("✅ should create a LIBRE member with valid matricule L10001")
        void shouldCreateLibreMember() {
            when(membreRepository.existsByMatricule("L10001")).thenReturn(false);
            when(membreRepository.existsByEmail(anyString())).thenReturn(false);
            when(membreRepository.save(any())).thenReturn(membreLibre);

            Membre result = membreService.create(membreLibre);

            assertThat(result.getTypeMembre()).isEqualTo(TypeMembre.LIBRE);
        }

        @Test
        @DisplayName("❌ should throw BusinessException when matricule already exists")
        void shouldThrowWhenMatriculeExists() {
            when(membreRepository.existsByMatricule("G1001")).thenReturn(true);

            assertThatThrownBy(() -> membreService.create(membreGlobal))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("matricule existe déjà");

            verify(membreRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ should throw BusinessException when email already exists")
        void shouldThrowWhenEmailExists() {
            when(membreRepository.existsByMatricule("G1001")).thenReturn(false);
            when(membreRepository.existsByEmail("lucas@email.com")).thenReturn(true);

            assertThatThrownBy(() -> membreService.create(membreGlobal))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("email existe déjà");

            verify(membreRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ should throw BusinessException when SITE member has no site")
        void shouldThrowWhenSiteMemberHasNoSite() {
            Membre membreSansSite = Membre.builder()
                    .matricule("S10002")
                    .nom("Test")
                    .prenom("Test")
                    .typeMembre(TypeMembre.SITE)
                    .solde(0.0)
                    .site(null) // ← pas de site
                    .build();

            when(membreRepository.existsByMatricule("S10002")).thenReturn(false);

            assertThatThrownBy(() -> membreService.create(membreSansSite))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("membre SITE doit être lié");
        }

        @Test
        @DisplayName("❌ should throw BusinessException when GLOBAL matricule format is wrong")
        void shouldThrowWhenGlobalMatriculeFormatIsWrong() {
            Membre badMembre = Membre.builder()
                    .matricule("G12") // ← trop court, doit être G + 4 chiffres
                    .typeMembre(TypeMembre.GLOBAL)
                    .solde(0.0)
                    .build();

            assertThatThrownBy(() -> membreService.create(badMembre))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Format de matricule invalide");
        }

        @Test
        @DisplayName("❌ should throw BusinessException when SITE matricule format is wrong")
        void shouldThrowWhenSiteMatriculeFormatIsWrong() {
            Membre badMembre = Membre.builder()
                    .matricule("S123") // ← doit être S + 5 chiffres
                    .typeMembre(TypeMembre.SITE)
                    .solde(0.0)
                    .site(site)
                    .build();

            assertThatThrownBy(() -> membreService.create(badMembre))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Format de matricule invalide");
        }

        @Test
        @DisplayName("❌ should throw BusinessException when LIBRE matricule starts with wrong letter")
        void shouldThrowWhenLibreMatriculeStartsWithWrongLetter() {
            Membre badMembre = Membre.builder()
                    .matricule("X10001") // ← doit commencer par L
                    .typeMembre(TypeMembre.LIBRE)
                    .solde(0.0)
                    .build();

            assertThatThrownBy(() -> membreService.create(badMembre))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Format de matricule invalide");
        }

        @Test
        @DisplayName("✅ should initialize solde to 0.0 on creation")
        void shouldInitializeSoldeToZero() {
            membreGlobal.setSolde(99.0); // on force un solde non nul
            when(membreRepository.existsByMatricule(any())).thenReturn(false);
            when(membreRepository.existsByEmail(any())).thenReturn(false);
            when(membreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Membre result = membreService.create(membreGlobal);

            assertThat(result.getSolde()).isEqualTo(0.0);
        }
    }

    // ================================================================
    // GET
    // ================================================================
    @Nested
    @DisplayName("getById() and getByMatricule()")
    class GetTests {

        @Test
        @DisplayName("✅ should return member when id exists")
        void shouldReturnMemberById() {
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));

            Membre result = membreService.getById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getMatricule()).isEqualTo("G1001");
        }

        @Test
        @DisplayName("❌ should throw ResourceNotFoundException when id not found")
        void shouldThrowWhenIdNotFound() {
            when(membreRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> membreService.getById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Membre introuvable");
        }

        @Test
        @DisplayName("✅ should return member when matricule exists")
        void shouldReturnMemberByMatricule() {
            when(membreRepository.findByMatricule("G1001")).thenReturn(Optional.of(membreGlobal));

            Membre result = membreService.getByMatricule("G1001");

            assertThat(result.getMatricule()).isEqualTo("G1001");
        }

        @Test
        @DisplayName("❌ should throw ResourceNotFoundException when matricule not found")
        void shouldThrowWhenMatriculeNotFound() {
            when(membreRepository.findByMatricule("G9999")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> membreService.getByMatricule("G9999"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("G9999");
        }
    }

    // ================================================================
    // PENALTY
    // ================================================================
    @Nested
    @DisplayName("hasActivePenalty()")
    class PenaltyTests {

        @Test
        @DisplayName("✅ should return true when member has active penalty")
        void shouldReturnTrueWhenActivePenalty() {
            when(penaliteRepository.existsByMembreIdAndDateFinAfter(eq(1L), any(LocalDate.class)))
                    .thenReturn(true);

            boolean result = membreService.hasActivePenalty(1L);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("✅ should return false when member has no active penalty")
        void shouldReturnFalseWhenNoPenalty() {
            when(penaliteRepository.existsByMembreIdAndDateFinAfter(eq(1L), any(LocalDate.class)))
                    .thenReturn(false);

            boolean result = membreService.hasActivePenalty(1L);

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("✅ should add penalty with dateFin = today + 7 days")
        void shouldAddPenaltyWithCorrectDateFin() {
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));
            when(penaliteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            membreService.addPenalty(1L);

            verify(penaliteRepository, times(1)).save(argThat(penalite ->
                    penalite.getDateFin().equals(LocalDate.now().plusWeeks(1)) &&
                            penalite.getMotif().equals("Match privé incomplet avant l'échéance")
            ));
        }
    }

    // ================================================================
    // OUTSTANDING BALANCE
    // ================================================================
    @Nested
    @DisplayName("hasOutstandingBalance()")
    class BalanceTests {

        @Test
        @DisplayName("✅ should return true when member has outstanding balance")
        void shouldReturnTrueWhenBalancePositive() {
            membreGlobal.setSolde(15.0);
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));

            boolean result = membreService.hasOutstandingBalance(1L);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("✅ should return false when member has no outstanding balance")
        void shouldReturnFalseWhenBalanceZero() {
            membreGlobal.setSolde(0.0);
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));

            boolean result = membreService.hasOutstandingBalance(1L);

            assertThat(result).isFalse();
        }
    }

    // ================================================================
    // UPDATE
    // ================================================================
    @Nested
    @DisplayName("update()")
    class UpdateTests {

        @Test
        @DisplayName("✅ should update member name and email")
        void shouldUpdateMember() {
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));
            when(membreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Membre updated = Membre.builder()
                    .nom("Nouveau")
                    .prenom("Nom")
                    .email("nouveau@email.com")
                    .build();

            Membre result = membreService.update(1L, updated);

            assertThat(result.getNom()).isEqualTo("Nouveau");
            assertThat(result.getPrenom()).isEqualTo("Nom");
            assertThat(result.getEmail()).isEqualTo("nouveau@email.com");
        }

        @Test
        @DisplayName("❌ should throw ResourceNotFoundException when updating non-existent member")
        void shouldThrowWhenUpdatingNonExistentMember() {
            when(membreRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> membreService.update(99L, membreGlobal))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ================================================================
    // DELETE
    // ================================================================
    @Nested
    @DisplayName("delete()")
    class DeleteTests {

        @Test
        @DisplayName("✅ should delete member when exists")
        void shouldDeleteMember() {
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));

            membreService.delete(1L);

            verify(membreRepository, times(1)).delete(membreGlobal);
        }

        @Test
        @DisplayName("❌ should throw ResourceNotFoundException when deleting non-existent member")
        void shouldThrowWhenDeletingNonExistentMember() {
            when(membreRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> membreService.delete(99L))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(membreRepository, never()).delete(any());
        }
    }
}
