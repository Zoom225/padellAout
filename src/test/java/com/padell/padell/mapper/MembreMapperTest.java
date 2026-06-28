package com.padell.padell.mapper;

import com.padell.padell.dto.request.MembreRequest;
import com.padell.padell.dto.response.MembreResponse;
import com.padell.padell.entity.Membre;
import com.padell.padell.entity.Site;
import com.padell.padell.entity.enums.TypeMembre;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("MembreMapper Tests")
class MembreMapperTest {

    private MembreMapper membreMapper;

    @BeforeEach
    void setUp() {
        membreMapper = new MembreMapper();
    }

    @Test
    @DisplayName("Doit mapper MembreRequest vers Membre Entity")
    void shouldMapMembreRequestToMembreEntity() {
        // Arrange
        MembreRequest request = MembreRequest.builder()
                .matricule("L12345")
                .nom("Doe")
                .prenom("John")
                .email("john.doe@example.com")
                .typeMembre(TypeMembre.LIBRE)
                .build();

        // Act
        Membre membre = membreMapper.toEntity(request);

        // Assert
        assertNotNull(membre);
        assertAll("Vérification du mapping de Request vers Entity",
                () -> assertEquals("L12345", membre.getMatricule()),
                () -> assertEquals("Doe", membre.getNom()),
                () -> assertEquals("John", membre.getPrenom()),
                () -> assertEquals("john.doe@example.com", membre.getEmail()),
                () -> assertEquals(TypeMembre.LIBRE, membre.getTypeMembre()),
                () -> assertNull(membre.getSite(), "Le site ne doit pas être mappé par le mapper")
        );
    }

    @Test
    @DisplayName("Doit mapper Membre Entity vers MembreResponse")
    void shouldMapMembreEntityToMembreResponse() {
        // Arrange
        Site site = new Site();
        site.setId(1L);
        site.setNom("Padel Club Central");

        // Correction : Construire l'objet, puis setter l'ID
        Membre membre = Membre.builder()
                .matricule("S54321")
                .nom("Smith")
                .prenom("Jane")
                .email("jane.smith@example.com")
                .typeMembre(TypeMembre.SITE)
                .site(site)
                .solde(25.5)
                .build();
        membre.setId(1L); // Simule l'ID généré par la base de données

        // Act
        MembreResponse response = membreMapper.toResponse(membre);

        // Assert
        assertNotNull(response);
        assertAll("Vérification du mapping de Entity vers Response",
                () -> assertEquals(1L, response.getId()),
                () -> assertEquals("S54321", response.getMatricule()),
                () -> assertEquals("Smith", response.getNom()),
                () -> assertEquals("Jane", response.getPrenom()),
                () -> assertEquals(TypeMembre.SITE, response.getTypeMembre()),
                () -> assertEquals(1L, response.getSiteId()),
                () -> assertEquals("Padel Club Central", response.getSiteNom()),
                () -> assertEquals(25.5, response.getSolde())
        );
    }

    @Test
    @DisplayName("Doit gérer un Site null lors du mapping vers MembreResponse")
    void shouldHandleNullSiteWhenMappingToMembreResponse() {
        // Arrange
        // Correction : Construire l'objet, puis setter l'ID
        Membre membre = Membre.builder()
                .matricule("G9876")
                .typeMembre(TypeMembre.GLOBAL) // Un membre GLOBAL n'a pas de site
                .site(null)
                .solde(0.0) // Initialiser tous les champs non-null
                .build();
        membre.setId(2L);

        // Act
        MembreResponse response = membreMapper.toResponse(membre);

        // Assert
        assertNotNull(response);
        assertAll("Vérification du mapping avec un site null",
                () -> assertEquals(2L, response.getId()),
                () -> assertNull(response.getSiteId()),
                () -> assertNull(response.getSiteNom())
        );
    }
}
