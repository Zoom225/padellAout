package com.padell.padell.service;

import com.padell.padell.entity.Terrain;

import java.util.List;

public interface TerrainService {
    Terrain create(Terrain terrain, Long siteId);
    Terrain getById(Long id);
    List<Terrain> getAll();
    List<Terrain> getBySiteId(Long siteId);
    Terrain update(Long id, Terrain terrain);
    void delete(Long id);
}
