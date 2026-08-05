package com.padell.padell.service.impl;

import com.padell.padell.dto.request.MembreRequest;
import com.padell.padell.entity.Membre;
import com.padell.padell.mapper.MembreMapper;
import com.padell.padell.service.MembreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MembreCreationService {

    private final MembreService membreService;
    private final MembreMapper membreMapper;

    public Membre create(MembreRequest request) {
        Membre membre = membreMapper.toEntity(request);
        return membreService.create(membre, request.getSiteId(), request.getPassword());
    }
}
