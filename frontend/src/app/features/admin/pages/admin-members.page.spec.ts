import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { MembreResponse } from '../../../shared/models/membre.model';
import { SiteResponse } from '../../../shared/models/site-terrain.model';
import { AdminMembersPage } from './admin-members.page';

describe('AdminMembersPage', () => {
  const members: MembreResponse[] = [
	{ id: 1, matricule: 'G1001', nom: 'Martin', prenom: 'Lucas', email: 'lucas@email.com', typeMembre: 'GLOBAL', siteId: null, siteNom: null, solde: 0 },
	{ id: 2, matricule: 'S10001', nom: 'Bernard', prenom: 'Tom', email: 'tom@email.com', typeMembre: 'SITE', siteId: 1, siteNom: 'Padel Club Lyon', solde: 5 },
	{ id: 3, matricule: 'S10002', nom: 'Leroy', prenom: 'Sarah', email: 'sarah@email.com', typeMembre: 'SITE', siteId: 2, siteNom: 'Padel Club Paris', solde: 0 }
  ];

  const sites: SiteResponse[] = [
	{ id: 1, nom: 'Padel Club Lyon', adresse: 'Lyon', heureOuverture: '08:00', heureFermeture: '22:00', dureeMatchMinutes: 90, dureeEntreMatchMinutes: 15, anneeCivile: 2026 },
	{ id: 2, nom: 'Padel Club Paris', adresse: 'Paris', heureOuverture: '07:00', heureFermeture: '23:00', dureeMatchMinutes: 90, dureeEntreMatchMinutes: 15, anneeCivile: 2026 }
  ];

  let membresApiMock: {
	getAll: ReturnType<typeof vi.fn>;
	create: ReturnType<typeof vi.fn>;
	update: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
	hasPenalty: ReturnType<typeof vi.fn>;
  };
  let sitesApiMock: { getAll: ReturnType<typeof vi.fn> };
  let adminSessionMock: {
	isGlobalAdmin: ReturnType<typeof vi.fn>;
	isSiteAdmin: ReturnType<typeof vi.fn>;
	siteId: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
	membresApiMock = {
	  getAll: vi.fn().mockReturnValue(of(members)),
	  create: vi.fn().mockReturnValue(of(members[0])),
	  update: vi.fn().mockReturnValue(of(members[1])),
	  delete: vi.fn().mockReturnValue(of(void 0)),
	  hasPenalty: vi.fn((id: number) => of(id === 2))
	};
	sitesApiMock = {
	  getAll: vi.fn().mockReturnValue(of(sites))
	};
	adminSessionMock = {
	  isGlobalAdmin: vi.fn().mockReturnValue(false),
	  isSiteAdmin: vi.fn().mockReturnValue(true),
	  siteId: vi.fn().mockReturnValue(1)
	};

	await TestBed.configureTestingModule({
	  imports: [AdminMembersPage],
	  providers: [
		provideRouter([]),
		provideNoopAnimations(),
		{ provide: MembresApiService, useValue: membresApiMock },
		{ provide: SitesApiService, useValue: sitesApiMock },
		{ provide: AdminSessionService, useValue: adminSessionMock }
	  ]
	}).compileComponents();
  });

  afterEach(() => {
	vi.restoreAllMocks();
	TestBed.resetTestingModule();
  });

  it('charge uniquement les membres et sites autorises pour un admin de site', () => {
	const fixture = TestBed.createComponent(AdminMembersPage);
	const component = fixture.componentInstance;

	expect(component.filteredMembers()).toHaveLength(2);
	expect(component.filteredMembers().map((m) => m.id)).toEqual([1, 2]);
	expect(component.sites()).toHaveLength(1);
	expect(component.sites()[0].id).toBe(1);
  });

  it('applique la recherche et les filtres par type', () => {
	adminSessionMock.isGlobalAdmin.mockReturnValue(true);
	adminSessionMock.isSiteAdmin.mockReturnValue(false);
	adminSessionMock.siteId.mockReturnValue(null);
	const fixture = TestBed.createComponent(AdminMembersPage);
	const component = fixture.componentInstance;

	component.searchQuery.set('sarah');
	expect(component.displayedMembers()).toHaveLength(1);
	expect(component.displayedMembers()[0].matricule).toBe('S10002');

	component.searchQuery.set('');
	component.typeFilter.set('SITE');
	expect(component.displayedMembers()).toHaveLength(2);
	expect(component.countByType('SITE')).toBe(2);
  });

  it('affiche le statut de penalite active d un membre', () => {
	const fixture = TestBed.createComponent(AdminMembersPage);
	const component = fixture.componentInstance;
	fixture.detectChanges();

	expect(membresApiMock.hasPenalty).toHaveBeenCalledWith(2);
	expect(component.hasActivePenalty(2)).toBe(true);
	expect(fixture.nativeElement.textContent).toContain('Pénalité active');
  });

  it('passe en mode édition puis sauvegarde la mise à jour du membre', () => {
	const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
	const fixture = TestBed.createComponent(AdminMembersPage);
	const component = fixture.componentInstance;

	component.edit(members[1]);

	expect(component.editingId()).toBe(2);
	expect(component.form.controls.matricule.value).toBe('S10001');
	expect(scrollSpy).toHaveBeenCalled();

	component.form.controls.nom.setValue('Bernard-Modifie');
	component.save();

	expect(membresApiMock.update).toHaveBeenCalledWith(
	  2,
	  expect.objectContaining({ matricule: 'S10001', nom: 'Bernard-Modifie', typeMembre: 'SITE', siteId: 1 })
	);
	expect(component.message()).toContain('Membre mis à jour');
	expect(component.editingId()).toBeNull();
  });

  it('supprime un membre après confirmation', () => {
	vi.spyOn(window, 'confirm').mockReturnValue(true);
	const fixture = TestBed.createComponent(AdminMembersPage);
	const component = fixture.componentInstance;

	component.remove(2);

	expect(membresApiMock.delete).toHaveBeenCalledWith(2);
	expect(component.message()).toContain('Membre supprimé');
  });
});
