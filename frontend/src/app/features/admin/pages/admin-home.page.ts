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
    <section class="admin-shell">
      <div class="admin-hero">
        <div>
          <p class="eyebrow">Tableau de bord</p>
          <h1>Administration PadelPlay</h1>
          <p class="hero-subtitle">
            Vue {{ adminSession.isGlobalAdmin() ? 'globale' : 'site' }} des matchs,
            reservations, membres et ressources du club.
          </p>
        </div>

        <div class="admin-actions">
          <a routerLink="/admin/members">Membres</a>
          <a routerLink="/admin/matches">Matchs</a>
          <a routerLink="/admin/sites">Sites</a>
          <a routerLink="/admin/terrains">Terrains</a>
          <a routerLink="/admin/fermetures">Fermetures</a>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-panel">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Chargement du tableau de bord...</span>
        </div>
      }
      @if (errorMessage()) {
        <p class="status-error">{{ errorMessage() }}</p>
      }

      <div class="kpi-grid">
        <div class="admin-kpi green">
          <p>Matchs</p>
          <strong>{{ matches().length }}</strong>
          <span>tous statuts</span>
        </div>
        <div class="admin-kpi blue">
          <p>Reservations</p>
          <strong>{{ reservations().length }}</strong>
          <span>{{ pendingReservationsCount() }} en attente</span>
        </div>
        <div class="admin-kpi slate">
          <p>Membres</p>
          <strong>{{ members().length }}</strong>
          <span>visibles</span>
        </div>
        <div class="admin-kpi amber">
          <p>Chiffre d'affaires</p>
          <strong>{{ revenue() }} EUR</strong>
          <span>paiements valides</span>
        </div>
      </div>

      <div class="dashboard-grid">
        <mat-card class="card-soft admin-panel">
          <mat-card-header>
            <mat-card-title>Occupation par site</mat-card-title>
            <mat-card-subtitle>Nombre de matchs rattaches a chaque site visible</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="data-list">
              @for (item of occupancyBySite(); track item.site) {
                <div class="data-row">
                  <span>{{ item.site }}</span>
                  <strong>{{ item.count }} match(s)</strong>
                </div>
              } @empty {
                <p class="empty-state">Aucune donnee.</p>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="card-soft admin-panel">
          <mat-card-header>
            <mat-card-title>Ressources</mat-card-title>
            <mat-card-subtitle>Controle rapide des elements geres par l'administration</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="resource-grid">
              <div>
                <span>Sites visibles</span>
                <strong>{{ sites().length }}</strong>
              </div>
              <div>
                <span>Terrains visibles</span>
                <strong>{{ terrains().length }}</strong>
              </div>
              <div>
                <span>Matchs complets</span>
                <strong>{{ completeMatchesCount() }}</strong>
              </div>
              <div>
                <span>Reservations en attente</span>
                <strong>{{ pendingReservationsCount() }}</strong>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .admin-shell {
      width: min(1220px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 2rem 0 4rem;
    }

    .admin-hero {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.5rem;
      padding: clamp(1.5rem, 3vw, 2.5rem);
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 118, 110, 0.9)),
        linear-gradient(90deg, rgba(255, 255, 255, 0.09) 1px, transparent 1px);
      background-size: auto, 44px 44px;
      color: #ffffff;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
    }

    .eyebrow {
      margin: 0 0 0.75rem;
      color: #99f6e4;
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.4rem);
      font-weight: 900;
      letter-spacing: 0;
      line-height: 1;
    }

    .hero-subtitle {
      max-width: 620px;
      margin: 1rem 0 0;
      color: rgba(255, 255, 255, 0.78);
      line-height: 1.65;
    }

    .admin-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.65rem;
    }

    .admin-actions a {
      padding: 0.55rem 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-size: 0.86rem;
      font-weight: 800;
      text-decoration: none;
      backdrop-filter: blur(12px);
      transition: background 0.15s, transform 0.15s;
    }

    .admin-actions a:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .loading-panel {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-top: 1.25rem;
      color: #475569;
      font-weight: 800;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-top: 1.25rem;
    }

    .admin-kpi {
      min-height: 148px;
      padding: 1.2rem;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
    }

    .admin-kpi p,
    .admin-kpi span {
      margin: 0;
      color: #64748b;
      font-size: 0.86rem;
      font-weight: 750;
    }

    .admin-kpi strong {
      display: block;
      margin: 0.75rem 0 0.5rem;
      color: #0f172a;
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      line-height: 1;
      font-weight: 900;
    }

    .admin-kpi.green {
      border-top: 4px solid #10b981;
    }

    .admin-kpi.blue {
      border-top: 4px solid #2563eb;
    }

    .admin-kpi.slate {
      border-top: 4px solid #475569;
    }

    .admin-kpi.amber {
      border-top: 4px solid #f59e0b;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      gap: 1rem;
      margin-top: 1rem;
    }

    .admin-panel {
      border-radius: 8px !important;
    }

    .data-list {
      display: grid;
      gap: 0.7rem;
      padding-top: 0.75rem;
    }

    .data-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.9rem 1rem;
      border: 1px solid rgba(15, 118, 110, 0.12);
      border-radius: 8px;
      background: #f0fdfa;
      color: #134e4a;
    }

    .data-row span {
      font-weight: 800;
    }

    .data-row strong {
      color: #0f766e;
      white-space: nowrap;
    }

    .resource-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.8rem;
      padding-top: 0.75rem;
    }

    .resource-grid div {
      min-height: 110px;
      padding: 1rem;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid rgba(15, 23, 42, 0.08);
    }

    .resource-grid span {
      display: block;
      color: #64748b;
      font-size: 0.86rem;
      font-weight: 750;
    }

    .resource-grid strong {
      display: block;
      margin-top: 0.65rem;
      color: #0f172a;
      font-size: 1.9rem;
      line-height: 1;
      font-weight: 900;
    }

    .empty-state {
      margin: 0;
      color: #64748b;
    }

    @media (max-width: 940px) {
      .admin-hero,
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .admin-hero {
        display: grid;
        align-items: start;
      }

      .admin-actions {
        justify-content: flex-start;
      }

      .kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .kpi-grid,
      .resource-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
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
            this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les reservations administrateur.'));
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
