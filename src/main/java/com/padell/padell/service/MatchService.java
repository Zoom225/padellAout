package com.padell.padell.service;

import com.padell.padell.dto.request.MatchRequest;
import com.padell.padell.entity.Match;
import com.padell.padell.dto.request.CreateMatchRequest;
import com.padell.padell.dto.response.MatchDto;

import java.util.List;

public interface MatchService {

    MatchDto createMatch(CreateMatchRequest request, String username);

    List<MatchDto> findAllMatches();

    List<MatchDto> getPublicAvailableMatches();

    List<MatchDto> findByOrganisateur(Long organisateurId);

    List<MatchDto> findBySite(Long siteId);

    Match getMatchEntityById(Long id);

    MatchDto getMatchDtoById(Long id);

    MatchDto updateMatch(Long matchId, MatchRequest request);

    void cancelMatch(Long matchId, Long requesterId);

    void convertToPublic(Long matchId);

    void incrementPlayers(Long matchId);

    void decrementPlayers(Long matchId);

    void checkAndConvertExpiredPrivateMatches();
}
