package com.padell.padell.service;

import com.padelPlay.dto.request.MatchRequest;
import com.padelPlay.entity.Match;
import com.padelPlay.match.dto.CreateMatchRequest;
import com.padelPlay.match.dto.MatchDto;

import java.util.List;

public interface MatchService {

    MatchDto createMatch(CreateMatchRequest request, String username);

    List<MatchDto> findAllMatches();

    List<MatchDto> getPublicAvailableMatches();

    List<MatchDto> findByOrganisateur(Long organisateurId);

    List<MatchDto> findBySite(Long siteId);

    Match getById(Long id);

    MatchDto getMatchDtoById(Long id);

    MatchDto updateMatch(Long matchId, MatchRequest request);

    void cancelMatch(Long matchId, Long requesterId);

    void convertToPublic(Long matchId);

    void incrementPlayers(Long matchId);

    void decrementPlayers(Long matchId);

    void checkAndConvertExpiredPrivateMatches();
}