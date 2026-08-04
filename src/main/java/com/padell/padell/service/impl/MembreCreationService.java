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
    private final MembreAccessService membreAccessService;

    public Membre create(MembreRequest request) {
        membreAccessService.assertCanCreate(request.getSiteId());
        Membre membre = membreMapper.toEntity(request);
        return membreService.create(membre, request.getSiteId(), request.getPassword());
    }
}
