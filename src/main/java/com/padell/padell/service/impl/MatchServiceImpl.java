package com.padell.padell.service.impl;

import com.padelPlay.dto.request.MatchRequest;
import com.padelPlay.entity.*;
import com.padelPlay.entity.enums.*;
import com.padelPlay.exception.BusinessException;
import com.padelPlay.exception.ResourceNotFoundException;
import com.padelPlay.mapper.MatchMapper;
import com.padelPlay.match.dto.CreateMatchRequest;
import com.padelPlay.match.dto.MatchDto;
import com.padelPlay.repository.*;
import com.padelPlay.service.MatchService;
import com.padelPlay.service.MembreService;
import com.padelPlay.service.TerrainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final MembreRepository membreRepository;
    private final ReservationRepository reservationRepository;
    private final PaiementRepository paiementRepository;
    private final JourFermetureRepository jourFermetureRepository;
    private final TerrainService terrainService;
    private final MembreService membreService;
    private final MatchMapper matchMapper;

    private static final double MATCH_PRICE = 60.0;
    private static final int MAX_PLAYERS = 4;

    @Override
    @Transactional
    public MatchDto createMatch(CreateMatchRequest request, String username) {
        Membre organisateur = membreRepository.findByMatricule(username)
                .orElseThrow(() -> new ResourceNotFoundException("Membre non trouvé pour l'utilisateur: " + username));

        Terrain terrain = terrainService.getById(request.terrainId());

        if (membreService.hasOutstandingBalance(organisateur.getId())) {
            throw new BusinessException("Vous avez un solde impayé et ne pouvez pas créer de match.");
        }
        if (membreService.hasActivePenalty(organisateur.getId())) {
            throw new BusinessException("Vous avez une pénalité active et ne pouvez pas créer de match.");
        }

        validateBookingDelay(organisateur, request.matchDate().toLocalDate());
        validateSiteAccessForOrganizer(organisateur, terrain);

        LocalDateTime dateDebut = request.matchDate();
        LocalDateTime dateFin = dateDebut.plusMinutes(terrain.getSite().getDureeMatchMinutes());

        validateSiteNotClosed(terrain, dateDebut.toLocalDate());
        validateSiteOpeningHours(terrain, dateDebut.toLocalTime(), dateFin.toLocalTime());

        if (!isSlotAvailable(terrain, dateDebut, dateFin)) {
            throw new BusinessException("Ce créneau est déjà réservé sur le terrain : " + terrain.getId());
        }

        Match match = new Match();
        match.setOrganisateur(organisateur);
        match.setTerrain(terrain);
        match.setDateDebut(dateDebut);
        match.setDateFin(dateFin);
        match.setTypeMatch(TypeMatch.valueOf(request.matchType()));
        match.setStatut(StatutMatch.PLANIFIE);
        match.setNbJoueursActuels(0);
        match.setPrixTotal(MATCH_PRICE);
        match.setPrixParJoueur(MATCH_PRICE / MAX_PLAYERS);

        Match savedMatch = matchRepository.save(match);
        createPendingReservationForOrganizer(savedMatch, organisateur);
        log.info("Match créé avec succès (ID: {}) par l'utilisateur {}", savedMatch.getId(), username);

        return matchMapper.toMatchDto(savedMatch);
    }

    @Override
    public List<MatchDto> findAllMatches() {
        return matchRepository.findAll().stream()
                .map(matchMapper::toMatchDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MatchDto> getPublicAvailableMatches() {
        return matchRepository.findByTypeMatchAndStatut(TypeMatch.PUBLIC, StatutMatch.PLANIFIE)
                .stream()
                .map(matchMapper::toMatchDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MatchDto> findByOrganisateur(Long organisateurId) {
        return matchRepository.findByOrganisateurId(organisateurId)
                .stream()
                .map(matchMapper::toMatchDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MatchDto> findBySite(Long siteId) {
        return matchRepository.findByTerrainSiteId(siteId)
                .stream()
                .map(matchMapper::toMatchDto)
                .collect(Collectors.toList());
    }

    @Override
    public Match getById(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match non trouvé avec l'ID : " + id));
    }

    @Override
    public MatchDto getMatchDtoById(Long id) {
        return matchMapper.toMatchDto(getById(id));
    }

    @Override
    @Transactional
    public MatchDto updateMatch(Long matchId, MatchRequest request) {
        Match match = getById(matchId);

        if (match.getStatut() == StatutMatch.ANNULE) {
            throw new BusinessException("Impossible de modifier un match annulé.");
        }
        if (!match.getOrganisateur().getId().equals(request.getOrganisateurId())) {
            throw new BusinessException("Seul l'organisateur peut modifier ce match.");
        }

        Terrain terrain = terrainService.getById(request.getTerrainId());
        LocalDateTime dateDebut = request.getDate().atTime(request.getHeureDebut());
        LocalDateTime dateFin = dateDebut.plusMinutes(terrain.getSite().getDureeMatchMinutes());

        validateSiteNotClosed(terrain, dateDebut.toLocalDate());
        validateSiteOpeningHours(terrain, dateDebut.toLocalTime(), dateFin.toLocalTime());

        if (!isSlotAvailableExcluding(terrain, dateDebut, dateFin, matchId)) {
            throw new BusinessException("Ce créneau est déjà réservé sur le terrain : " + terrain.getId());
        }

        match.setTerrain(terrain);
        match.setDateDebut(dateDebut);
        match.setDateFin(dateFin);
        match.setTypeMatch(request.getTypeMatch());

        return matchMapper.toMatchDto(matchRepository.save(match));
    }

    @Override
    @Transactional
    public void cancelMatch(Long matchId, Long requesterId) {
        Match match = getById(matchId);

        if (match.getStatut() == StatutMatch.ANNULE) {
            throw new BusinessException("Ce match est déjà annulé.");
        }
        if (!match.getOrganisateur().getId().equals(requesterId)) {
            throw new BusinessException("Seul l'organisateur peut annuler ce match.");
        }

        match.setStatut(StatutMatch.ANNULE);
        matchRepository.save(match);
        log.info("Match {} annulé par l'organisateur {}", matchId, requesterId);
    }

    @Override
    @Transactional
    public void checkAndConvertExpiredPrivateMatches() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime startOfDay = tomorrow.atStartOfDay();
        LocalDateTime endOfDay = tomorrow.atTime(LocalTime.MAX);

        List<Match> expiredMatches = matchRepository
                .findByDateDebutBetweenAndStatut(startOfDay, endOfDay, StatutMatch.PLANIFIE)
                .stream()
                .filter(m -> m.getTypeMatch() == TypeMatch.PRIVE && m.getNbJoueursActuels() < MAX_PLAYERS)
                .toList();

        if (!expiredMatches.isEmpty()) {
            expiredMatches.forEach(m -> convertToPublic(m.getId()));
            log.info("Scheduler : {} match(s) privé(s) ont été converti(s) en public", expiredMatches.size());
        }
    }

    @Override
    @Transactional
    public void convertToPublic(Long matchId) {
        Match match = getById(matchId);
        if (match.getTypeMatch() == TypeMatch.PUBLIC) {
            throw new BusinessException("Le match est déjà public.");
        }
        match.setTypeMatch(TypeMatch.PUBLIC);
        match.setDateConversionPublic(LocalDateTime.now());
        matchRepository.save(match);
        membreService.addPenalty(match.getOrganisateur().getId());
        log.info("Match {} converti en public, pénalité appliquée à l'organisateur {}", matchId, match.getOrganisateur().getId());
    }

    @Override
    @Transactional
    public void incrementPlayers(Long matchId) {
        Match match = getById(matchId);
        if (match.getNbJoueursActuels() >= MAX_PLAYERS) {
            throw new BusinessException("Le match est déjà complet.");
        }
        match.setNbJoueursActuels(match.getNbJoueursActuels() + 1);
        if (match.getNbJoueursActuels() == MAX_PLAYERS) {
            match.setStatut(StatutMatch.COMPLET);
        }
        matchRepository.save(match);
    }

    @Override
    @Transactional
    public void decrementPlayers(Long matchId) {
        Match match = getById(matchId);
        if (match.getNbJoueursActuels() <= 0) {
            throw new BusinessException("Le match n'a aucun joueur.");
        }
        match.setNbJoueursActuels(match.getNbJoueursActuels() - 1);
        if (match.getStatut() == StatutMatch.COMPLET) {
            match.setStatut(StatutMatch.PLANIFIE);
        }
        matchRepository.save(match);
    }

    private boolean isSlotAvailable(Terrain terrain, LocalDateTime start, LocalDateTime end) {
        int breakMinutes = terrain.getSite().getDureeEntreMatchMinutes();
        List<Match> existingMatches = matchRepository.findOverlappingMatches(
                terrain.getId(),
                start.minusMinutes(breakMinutes),
                end.plusMinutes(breakMinutes),
                StatutMatch.ANNULE
        );
        return existingMatches.isEmpty();
    }

    private boolean isSlotAvailableExcluding(Terrain terrain, LocalDateTime start, LocalDateTime end, Long excludedMatchId) {
        int breakMinutes = terrain.getSite().getDureeEntreMatchMinutes();
        List<Match> existingMatches = matchRepository.findOverlappingMatches(
                terrain.getId(),
                start.minusMinutes(breakMinutes),
                end.plusMinutes(breakMinutes),
                StatutMatch.ANNULE
        );
        return existingMatches.stream().allMatch(m -> m.getId().equals(excludedMatchId));
    }

    private void validateBookingDelay(Membre membre, LocalDate matchDate) {
        long daysUntilMatch = ChronoUnit.DAYS.between(LocalDate.now(), matchDate);
        int maxDaysAhead = switch (membre.getTypeMembre()) {
            case GLOBAL -> 21;
            case SITE -> 14;
            case LIBRE -> 5;
        };

        if (daysUntilMatch < 0) {
            throw new BusinessException("La date du match est déjà passée.");
        }
        if (daysUntilMatch > maxDaysAhead) {
            throw new BusinessException("Le membre " + membre.getTypeMembre()
                    + " ne peut pas réserver plus de " + maxDaysAhead + " jours à l'avance.");
        }
    }

    private void validateSiteNotClosed(Terrain terrain, LocalDate date) {
        boolean closedGlobally = jourFermetureRepository.existsByDateAndGlobalTrue(date);
        boolean closedForSite = jourFermetureRepository.existsByDateAndSiteId(date, terrain.getSite().getId());
        if (closedGlobally || closedForSite) {
            throw new BusinessException("Le site est fermé à la date : " + date);
        }
    }

    private void validateSiteOpeningHours(Terrain terrain, LocalTime heureDebut, LocalTime heureFin) {
        LocalTime openingTime = terrain.getSite().getHeureOuverture();
        LocalTime closingTime = terrain.getSite().getHeureFermeture();
        if (heureDebut.isBefore(openingTime) || heureFin.isAfter(closingTime)) {
            throw new BusinessException("Le match est en dehors des heures d'ouverture du site (" + openingTime + " - " + closingTime + ").");
        }
    }

    private void validateSiteAccessForOrganizer(Membre organisateur, Terrain terrain) {
        if (organisateur.getTypeMembre() == TypeMembre.SITE) {
            if (organisateur.getSite() == null || !organisateur.getSite().getId().equals(terrain.getSite().getId())) {
                throw new BusinessException("Un membre SITE ne peut créer un match que sur son propre site.");
            }
        }
    }

    private void createPendingReservationForOrganizer(Match match, Membre organisateur) {
        Reservation reservation = Reservation.builder()
                .match(match)
                .membre(organisateur)
                .statut(StatutReservation.EN_ATTENTE)
                .build();
        reservation = reservationRepository.save(reservation);

        Paiement paiement = Paiement.builder()
                .reservation(reservation)
                .montant(match.getPrixParJoueur())
                .statut(StatutPaiement.EN_ATTENTE)
                .build();
        paiement = paiementRepository.save(paiement);
        reservation.setPaiement(paiement);
    }
}
