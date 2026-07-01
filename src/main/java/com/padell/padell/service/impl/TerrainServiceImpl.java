package com.padell.padell.service.impl;

import com.padell.padell.entity.Site;
import com.padell.padell.entity.Terrain;
import com.padell.padell.exception.ResourceNotFoundException;
import com.padell.padell.repository.TerrainRepository;
import com.padell.padell.service.SiteService;
import com.padell.padell.service.TerrainService;
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
        // Règle métier: Le site auquel le terrain est rattaché doit exister.
        Site site = siteService.getById(siteId);
        terrain.setSite(site);
        log.info("Terrain créé pour le site {}", siteId);
        return terrainRepository.save(terrain);
    }

    @Override
    public Terrain getById(Long id) {
        // Règle métier: Le terrain doit exister pour être récupéré par ID.
        return terrainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Terrain introuvable avec l'ID : " + id));
    }

    @Override
    public List<Terrain> getAll() {
        return terrainRepository.findAll();
    }

    @Override
    public List<Terrain> getBySiteId(Long siteId) {
        // Règle métier: Le site doit exister pour pouvoir récupérer ses terrains.
        siteService.getById(siteId);
        return terrainRepository.findBySiteId(siteId);
    }

    @Override
    public Terrain update(Long id, Terrain terrain) {
        // Règle métier: Le terrain à mettre à jour doit exister.
        Terrain existing = getById(id);
        existing.setNom(terrain.getNom());
        return terrainRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        // Règle métier: Le terrain à supprimer doit exister.
        Terrain existing = getById(id);
        terrainRepository.delete(existing);
    }
}
