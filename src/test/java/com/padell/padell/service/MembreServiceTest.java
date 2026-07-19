package com.padell.padell.service;

import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.enums.TypeMembre;
import com.padell.padell.exception.BusinessException;
import com.padell.padell.exception.ResourceNotFoundException;
import com.padell.padell.repository.MembreRepository;
import com.padell.padell.repository.PenaliteRepository;
import com.padell.padell.service.impl.MembreServiceImpl;
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
@DisplayName("Tests de MembreService")
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
        @DisplayName("✅ doit créer un membre GLOBAL avec un matricule valide G1001")
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
        @DisplayName("✅ doit créer un membre SITE lié à un site")
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
        @DisplayName("✅ doit créer un membre LIBRE avec un matricule valide L10001")
        void shouldCreateLibreMember() {
            when(membreRepository.existsByMatricule("L10001")).thenReturn(false);
            when(membreRepository.existsByEmail(anyString())).thenReturn(false);
            when(membreRepository.save(any())).thenReturn(membreLibre);

            Membre result = membreService.create(membreLibre);

            assertThat(result.getTypeMembre()).isEqualTo(TypeMembre.LIBRE);
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand le matricule existe déjà")
        void shouldThrowWhenMatriculeExists() {
            when(membreRepository.existsByMatricule("G1001")).thenReturn(true);

            assertThatThrownBy(() -> membreService.create(membreGlobal))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("matricule existe déjà");

            verify(membreRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand l'email existe déjà")
        void shouldThrowWhenEmailExists() {
            when(membreRepository.existsByMatricule("G1001")).thenReturn(false);
            when(membreRepository.existsByEmail("lucas@email.com")).thenReturn(true);

            assertThatThrownBy(() -> membreService.create(membreGlobal))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("email existe déjà");

            verify(membreRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ doit lever une BusinessException quand un membre SITE n'a pas de site")
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
        @DisplayName("❌ doit lever une BusinessException quand le format du matricule GLOBAL est incorrect")
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
        @DisplayName("❌ doit lever une BusinessException quand le format du matricule SITE est incorrect")
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
        @DisplayName("❌ doit lever une BusinessException quand le matricule LIBRE commence par la mauvaise lettre")
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
        @DisplayName("✅ doit initialiser le solde à 0.0 lors de la création")
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
        @DisplayName("✅ doit retourner le membre quand l'id existe")
        void shouldReturnMemberById() {
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));

            Membre result = membreService.getById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getMatricule()).isEqualTo("G1001");
        }

        @Test
        @DisplayName("❌ doit lever une ResourceNotFoundException quand l'id n'est pas trouvé")
        void shouldThrowWhenIdNotFound() {
            when(membreRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> membreService.getById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Membre introuvable");
        }

        @Test
        @DisplayName("✅ doit retourner le membre quand le matricule existe")
        void shouldReturnMemberByMatricule() {
            when(membreRepository.findByMatricule("G1001")).thenReturn(Optional.of(membreGlobal));

            Membre result = membreService.getByMatricule("G1001");

            assertThat(result.getMatricule()).isEqualTo("G1001");
        }

        @Test
        @DisplayName("❌ doit lever une ResourceNotFoundException quand le matricule n'est pas trouvé")
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
        @DisplayName("✅ doit retourner vrai quand le membre a une pénalité active")
        void shouldReturnTrueWhenActivePenalty() {
            when(penaliteRepository.existsByMembreIdAndDateFinAfter(eq(1L), any(LocalDate.class)))
                    .thenReturn(true);

            boolean result = membreService.hasActivePenalty(1L);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("✅ doit retourner faux quand le membre n'a pas de pénalité active")
        void shouldReturnFalseWhenNoPenalty() {
            when(penaliteRepository.existsByMembreIdAndDateFinAfter(eq(1L), any(LocalDate.class)))
                    .thenReturn(false);

            boolean result = membreService.hasActivePenalty(1L);

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("✅ doit ajouter une pénalité avec dateFin = aujourd'hui + 7 jours")
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
        @DisplayName("✅ doit retourner vrai quand le membre a un solde impayé")
        void shouldReturnTrueWhenBalancePositive() {
            membreGlobal.setSolde(15.0);
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));

            boolean result = membreService.hasOutstandingBalance(1L);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("✅ doit retourner faux quand le membre n'a pas de solde impayé")
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
        @DisplayName("✅ doit mettre à jour le nom et l'email du membre")
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
        @DisplayName("❌ doit lever une ResourceNotFoundException lors de la mise à jour d'un membre inexistant")
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
        @DisplayName("✅ doit supprimer le membre quand il existe")
        void shouldDeleteMember() {
            when(membreRepository.findById(1L)).thenReturn(Optional.of(membreGlobal));

            membreService.delete(1L);

            verify(membreRepository, times(1)).delete(membreGlobal);
        }

        @Test
        @DisplayName("❌ doit lever une ResourceNotFoundException lors de la suppression d'un membre inexistant")
        void shouldThrowWhenDeletingNonExistentMember() {
            when(membreRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> membreService.delete(99L))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(membreRepository, never()).delete(any());
        }
    }
}
