import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { TerrainsApiService } from '../../../core/api/terrains-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { SiteResponse, TerrainResponse } from '../../../shared/models/site-terrain.model';
import { AdminTerrainsPage } from './admin-terrains.page';

describe('AdminTerrainsPage', () => {
  const site: SiteResponse = {
    id: 1,
    nom: 'Padel Club Lyon',
    adresse: 'Lyon',
    heureOuverture: '08:00',
    heureFermeture: '22:00',
    dureeMatchMinutes: 90,
    dureeEntreMatchMinutes: 15,
    anneeCivile: 2026
  };

  const terrains: TerrainResponse[] = [
    { id: 10, nom: 'Court A', siteId: 1, siteNom: 'Padel Club Lyon', prix: 60 },
    { id: 11, nom: 'Court B', siteId: 1, siteNom: 'Padel Club Lyon', prix: 60 }
  ];

  let terrainsApiMock: {
    getAll: ReturnType<typeof vi.fn>;
    getBySite: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let sitesApiMock: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let adminSessionMock: {
    isGlobalAdmin: ReturnType<typeof vi.fn>;
    isSiteAdmin: ReturnType<typeof vi.fn>;
    siteId: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    terrainsApiMock = {
      getAll: vi.fn().mockReturnValue(of(terrains)),
      getBySite: vi.fn().mockReturnValue(of(terrains)),
      create: vi.fn().mockReturnValue(of(terrains[0])),
      update: vi.fn().mockReturnValue(of(terrains[0])),
      delete: vi.fn().mockReturnValue(of(void 0))
    };
    sitesApiMock = {
      getAll: vi.fn().mockReturnValue(of([site])),
      getById: vi.fn().mockReturnValue(of(site))
    };
    adminSessionMock = {
      isGlobalAdmin: vi.fn().mockReturnValue(false),
      isSiteAdmin: vi.fn().mockReturnValue(true),
      siteId: vi.fn().mockReturnValue(1)
    };

    await TestBed.configureTestingModule({
      imports: [AdminTerrainsPage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: TerrainsApiService, useValue: terrainsApiMock },
        { provide: SitesApiService, useValue: sitesApiMock },
        { provide: AdminSessionService, useValue: adminSessionMock }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('charge uniquement le site et les terrains de l admin SITE', () => {
    const fixture = TestBed.createComponent(AdminTerrainsPage);
    const component = fixture.componentInstance;

    expect(terrainsApiMock.getBySite).toHaveBeenCalledWith(1);
    expect(terrainsApiMock.getAll).not.toHaveBeenCalled();
    expect(sitesApiMock.getById).toHaveBeenCalledWith(1);
    expect(sitesApiMock.getAll).not.toHaveBeenCalled();
    expect(component.terrains()).toEqual(terrains);
    expect(component.sites()).toEqual([site]);
    expect(component.form.controls.siteId.value).toBe(1);
    expect(component.errorMessage()).toBe('');
  });
});
