import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { TerrainsApiService } from '../../../core/api/terrains-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { MatchResponse } from '../../../shared/models/match.model';
import { MembreResponse } from '../../../shared/models/membre.model';
import { ReservationResponse } from '../../../shared/models/reservation.model';
import { SiteResponse, TerrainResponse } from '../../../shared/models/site-terrain.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-admin-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <!-- En-tête dashboard -->
    <div class="adm-dash-header">
      <div class="adm-dash-header-inner">
        <div class="adm-dash-title-block">
          <span class="adm-dash-icon">🏆</span>
          <div>
            <h1 class="adm-dash-title">Dashboard administrateur</h1>
            <p class="adm-dash-sub">Vue {{ adminSession.isGlobalAdmin() ? 'globale' : 'site' }} des indicateurs principaux</p>
          </div>
        </div>
        <div class="adm-dash-nav">
          <a routerLink="/admin/members" class="adm-nav-btn adm-nav-members">👥 Membres</a>
          <a routerLink="/admin/matches" class="adm-nav-btn adm-nav-matches">🎾 Matchs</a>
          <a routerLink="/admin/sites" class="adm-nav-btn adm-nav-sites">🏟️ Sites</a>
          <a routerLink="/admin/terrains" class="adm-nav-btn adm-nav-terrains">📍 Terrains</a>
          <a routerLink="/admin/fermetures" class="adm-nav-btn adm-nav-fermetures">🔒 Fermetures</a>
        </div>
      </div>
    </div>

    <section class="page-shell">
      @if (loading()) {
        <mat-spinner diameter="32"></mat-spinner>
      }
      @if (errorMessage()) {
        <p class="status-error">{{ errorMessage() }}</p>
      }

      <!-- KPI Cards -->
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div class="adm-kpi adm-kpi-blue">
          <span class="adm-kpi-icon">🎾</span>
          <div>
            <p class="adm-kpi-label">Matchs</p>
            <p class="adm-kpi-value">{{ matches().length }}</p>
          </div>
        </div>
        <div class="adm-kpi adm-kpi-violet">
          <span class="adm-kpi-icon">📋</span>
          <div>
            <p class="adm-kpi-label">Réservations</p>
            <p class="adm-kpi-value">{{ reservations().length }}</p>
          </div>
        </div>
        <div class="adm-kpi adm-kpi-green">
          <span class="adm-kpi-icon">👥</span>
          <div>
            <p class="adm-kpi-label">Membres</p>
            <p class="adm-kpi-value">{{ members().length }}</p>
          </div>
        </div>
        <div class="adm-kpi adm-kpi-amber">
          <span class="adm-kpi-icon">💶</span>
          <div>
            <p class="adm-kpi-label">Chiffre d'affaires</p>
            <p class="adm-kpi-value">{{ revenue() }} €</p>
          </div>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <mat-card class="card-soft">
          <mat-card-header>
            <mat-card-title>📊 Occupation par site</mat-card-title>
          </mat-card-header>
          <mat-card-content class="space-y-3 pt-2">
            @for (item of occupancyBySite(); track item.site) {
              <div class="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <span class="font-medium text-sky-900">{{ item.site }}</span>
                <span class="rounded-full bg-sky-600 px-3 py-0.5 text-sm font-bold text-white">{{ item.count }} match(s)</span>
              </div>
            } @empty {
              <p class="text-slate-500">Aucune donnée.</p>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="card-soft">
          <mat-card-header>
            <mat-card-title>📦 Ressources</mat-card-title>
          </mat-card-header>
          <mat-card-content class="space-y-3 pt-2">
            <div class="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
              <span class="text-indigo-800 font-medium">Sites visibles</span>
              <span class="font-bold text-indigo-900">{{ sites().length }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
              <span class="text-teal-800 font-medium">Terrains visibles</span>
              <span class="font-bold text-teal-900">{{ terrains().length }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
              <span class="text-orange-800 font-medium">Matchs complets</span>
              <span class="font-bold text-orange-900">{{ completeMatchesCount() }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3">
              <span class="text-rose-800 font-medium">Réservations en attente</span>
              <span class="font-bold text-rose-900">{{ pendingReservationsCount() }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>

    <style>
      .adm-dash-header {
        background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 45%, #0284c7 100%);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 16px rgba(3,105,161,0.25);
      }
      .adm-dash-header-inner {
        display: flex; flex-wrap: wrap; align-items: center;
        justify-content: space-between; gap: 1.25rem;
        max-width: 1200px; margin: 0 auto;
      }
      .adm-dash-title-block { display: flex; align-items: center; gap: 1rem; }
      .adm-dash-icon { font-size: 2.5rem; }
      .adm-dash-title { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
      .adm-dash-sub { color: rgba(255,255,255,0.75); font-size: 0.85rem; margin: 0; }

      .adm-dash-nav { display: flex; flex-wrap: wrap; gap: 0.75rem; }
      .adm-nav-btn {
        display: inline-block; padding: 0.5rem 1.1rem; border-radius: 9999px;
        font-weight: 700; font-size: 0.82rem; text-decoration: none;
        transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      }
      .adm-nav-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
      .adm-nav-members  { background: #dcfce7; color: #14532d; }
      .adm-nav-matches  { background: #fff7ed; color: #9a3412; }
      .adm-nav-sites    { background: #ede9fe; color: #4c1d95; }
      .adm-nav-terrains { background: #ecfeff; color: #164e63; }
      .adm-nav-fermetures { background: #fef3c7; color: #78350f; }

      .adm-kpi {
        display: flex; align-items: center; gap: 1rem;
        border-radius: 1.25rem; padding: 1.25rem 1.5rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.07);
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .adm-kpi:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
      .adm-kpi-icon { font-size: 2.25rem; }
      .adm-kpi-label { font-size: 0.8rem; font-weight: 600; margin: 0 0 0.15rem; opacity: 0.8; }
      .adm-kpi-value { font-size: 2rem; font-weight: 800; margin: 0; line-height: 1; }
      .adm-kpi-blue   { background: linear-gradient(135deg,#dbeafe,#eff6ff); color: #1d4ed8; }
      .adm-kpi-violet { background: linear-gradient(135deg,#ede9fe,#f5f3ff); color: #6d28d9; }
      .adm-kpi-green  { background: linear-gradient(135deg,#dcfce7,#f0fdf4); color: #15803d; }
      .adm-kpi-amber  { background: linear-gradient(135deg,#fef3c7,#fffbeb); color: #b45309; }
    </style>
  `
})
export class AdminHomePage {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly membresApi = inject(MembresApiService);
  private readonly reservationsApi = inject(ReservationsApiService);
  private readonly sitesApi = inject(SitesApiService);
  private readonly terrainsApi = inject(TerrainsApiService);
  readonly adminSession = inject(AdminSessionService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly matches = signal<MatchResponse[]>([]);
  readonly members = signal<MembreResponse[]>([]);
  readonly reservations = signal<ReservationResponse[]>([]);
  readonly sites = signal<SiteResponse[]>([]);
  readonly terrains = signal<TerrainResponse[]>([]);

  readonly revenue = computed(() =>
    this.reservations()
      .filter((reservation) => reservation.paiement?.statut === 'PAYE')
      .reduce((sum, reservation) => sum + (reservation.paiement?.montant ?? 0), 0)
  );
  readonly completeMatchesCount = computed(() => this.matches().filter((match) => match.statut === 'COMPLET').length);
  readonly pendingReservationsCount = computed(
    () => this.reservations().filter((reservation) => reservation.statut === 'EN_ATTENTE').length
  );
  readonly occupancyBySite = computed(() => {
    const map = new Map<string, number>();
    this.matches().forEach((match) => map.set(match.siteNom, (map.get(match.siteNom) ?? 0) + 1));
    return Array.from(map.entries()).map(([site, count]) => ({ site, count }));
  });

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      matches: this.matchesApi.getAll(),
      members: this.membresApi.getAll(),
      sites: this.sitesApi.getAll(),
      terrains: this.terrainsApi.getAll()
    }).subscribe({
      next: ({ matches, members, sites, terrains }) => {
        const filteredSites = this.filterSites(sites);
        const filteredTerrains = this.filterTerrains(terrains);
        const filteredMembers = this.filterMembers(members);
        const filteredMatches = this.filterMatches(matches, filteredSites);

        this.sites.set(filteredSites);
        this.terrains.set(filteredTerrains);
        this.members.set(filteredMembers);
        this.matches.set(filteredMatches);

        if (!filteredMatches.length) {
          this.reservations.set([]);
          this.loading.set(false);
          return;
        }

        forkJoin(filteredMatches.map((match) => this.reservationsApi.getByMatch(match.id))).subscribe({
          next: (allReservations) => {
            this.reservations.set(allReservations.flat());
            this.loading.set(false);
          },
          error: (error) => {
            this.loading.set(false);
            this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les réservations administrateur.'));
          }
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger le tableau de bord administrateur.'));
      }
    });
  }

  private filterSites(sites: SiteResponse[]): SiteResponse[] {
    const siteId = this.adminSession.siteId();
    if (this.adminSession.isGlobalAdmin() || !siteId) {
      return sites;
    }
    return sites.filter((site) => site.id === siteId);
  }

  private filterTerrains(terrains: TerrainResponse[]): TerrainResponse[] {
    const siteId = this.adminSession.siteId();
    if (this.adminSession.isGlobalAdmin() || !siteId) {
      return terrains;
    }
    return terrains.filter((terrain) => terrain.siteId === siteId);
  }

  private filterMembers(members: MembreResponse[]): MembreResponse[] {
    const siteId = this.adminSession.siteId();
    if (this.adminSession.isGlobalAdmin() || !siteId) {
      return members;
    }
    return members.filter((member) => member.siteId === siteId || member.siteId === null);
  }

  private filterMatches(matches: MatchResponse[], sites: SiteResponse[]): MatchResponse[] {
    if (this.adminSession.isGlobalAdmin()) {
      return matches;
    }

    const siteNames = new Set(sites.map((site) => site.nom));
    return matches.filter((match) => siteNames.has(match.siteNom));
  }
}
