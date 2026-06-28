package com.padell.padell.mapper;

import com.padell.padell.dto.request.TerrainRequest;
import com.padell.padell.dto.response.TerrainResponse;
import com.padell.padell.entity.Terrain;
import org.springframework.stereotype.Component;

@Component
public class TerrainMapper {

    public Terrain toEntity(TerrainRequest request) {
        return Terrain.builder()
                .nom(request.getNom())
                .build();
    }

    public TerrainResponse toResponse(Terrain terrain) {
        return TerrainResponse.builder()
                .id(terrain.getId())
                .nom(terrain.getNom())
                .siteId(terrain.getSite() != null ? terrain.getSite().getId() : null)
                .siteNom(terrain.getSite() != null ? terrain.getSite().getNom() : null)
                .prix(terrain.getPrix())
                .build();
    }
}
