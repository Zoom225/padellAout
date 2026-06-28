package com.padell.padell.service.impl;

import com.padelPlay.entity.Site;
import com.padelPlay.entity.Terrain;
import com.padelPlay.exception.ResourceNotFoundException;
import com.padelPlay.repository.TerrainRepository;
import com.padelPlay.service.SiteService;
import com.padelPlay.service.TerrainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerrainServiceImpl implements TerrainService {

    private final TerrainRepository terrainRepository;
    private final SiteService siteService;

    @Override
    public Terrain create(Terrain terrain, Long siteId) {
        Site site = siteService.getById(siteId);
        terrain.setSite(site);
        log.info("Terrain créé pour le site {}", siteId);
        return terrainRepository.save(terrain);
    }

    @Override
    public Terrain getById(Long id) {
        return terrainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Terrain introuvable avec l'ID : " + id));
    }

    @Override
    public List<Terrain> getAll() {
        return terrainRepository.findAll();
    }

    @Override
    public List<Terrain> getBySiteId(Long siteId) {
        // Vérifie que le site existe, sinon lève ResourceNotFoundException
        siteService.getById(siteId);
        return terrainRepository.findBySiteId(siteId);
    }

    @Override
    public Terrain update(Long id, Terrain terrain) {
        Terrain existing = getById(id);
        existing.setNom(terrain.getNom());
        return terrainRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        Terrain existing = getById(id);
        terrainRepository.delete(existing);
    }
}
