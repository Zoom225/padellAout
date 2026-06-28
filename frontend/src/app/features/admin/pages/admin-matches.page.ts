import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { MatchResponse } from '../../../shared/models/match.model';
import { ReservationResponse } from '../../../shared/models/reservation.model';
import { SiteResponse } from '../../../shared/models/site-terrain.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-admin-matches-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <!-- En-tête matchs -->
    <div class="adm-match-header">
      <div class="adm-match-header-inner">
        <div class="adm-match-title-block">
          <span class="adm-match-icon">🎾</span>
          <div>
            <h1 class="adm-match-title">Gestion des matchs</h1>
            <p class="adm-match-sub">Consultation, détails et conversion en public</p>
          </div>
        </div>
        <a routerLink="/admin" class="adm-match-back-btn">← Tableau de bord</a>
      </div>
    </div>

    <section class="page-shell">
      @if (loading()) {
        <mat-spinner diameter="32"></mat-spinner>
      }
      @if (message()) {
        <p class="status-success">✅ {{ message() }}</p>
      }
      @if (errorMessage()) {
        <p class="status-error">❌ {{ errorMessage() }}</p>
      }

      <div class="grid gap-5 lg:grid-cols-2">
        @for (match of filteredMatches(); track match.id) {
          <mat-card class="adm-match-card">
            <mat-card-header class="adm-match-card-header">
              <div class="adm-match-card-title-row">
                <div>
                  <mat-card-title class="adm-match-card-title">{{ match.terrainNom }}</mat-card-title>
                  <mat-card-subtitle class="adm-match-card-sub">🏟️ {{ match.siteNom }}</mat-card-subtitle>
                </div>
                <span class="ds-badge" [class]="typeBadgeClass(match.typeMatch)">{{ match.typeMatch }}</span>
              </div>
              <div class="adm-match-date-row">
                <span>📅 {{ match.date }}</span>
                <span>🕐 {{ match.heureDebut }} – {{ match.heureFin }}</span>
              </div>
            </mat-card-header>

            <mat-card-content class="adm-match-content">
              <div class="adm-match-info-grid">
                <div class="adm-info-item">
                  <span class="adm-info-label">Organisateur</span>
                  <span class="adm-info-value">{{ match.organisateurNom }}</span>
                </div>
                <div class="adm-info-item">
                  <span class="adm-info-label">Statut</span>
                  <span class="ds-badge" [class]="statusBadgeClass(match.statut)">{{ match.statut }}</span>
                </div>
                <div class="adm-info-item adm-players-item">
                  <span class="adm-info-label">Joueurs</span>
                  <div class="adm-players-bar">
                    <div class="adm-players-fill" [style.width.%]="(match.nbJoueursActuels / 4) * 100">
                      <span>{{ match.nbJoueursActuels }}/4</span>
                    </div>
                  </div>
                </div>
              </div>

              @if (selectedMatchId() === match.id) {
                <div class="adm-reservations-panel">
                  <p class="adm-reservations-title">📋 Réservations du match</p>
                  @for (reservation of selectedReservations(); track reservation.id) {
                    <div class="adm-reservation-item">
                      <span class="font-medium">{{ reservation.membreNom }}</span>
                      <div class="flex gap-2">
                        <span class="ds-badge" [class]="reservationBadgeClass(reservation.statut)">{{ reservation.statut }}</span>
                        <span class="ds-badge" [class]="paymentBadgeClass(reservation.paiement?.statut)">{{ reservation.paiement?.statut || 'N/A' }}</span>
                      </div>
                    </div>
                  } @empty {
                    <p class="text-sm text-slate-500 text-center py-2">Aucune réservation.</p>
                  }
                </div>
              }
            </mat-card-content>

            <mat-card-actions class="adm-match-actions">
              <button class="adm-match-btn-details" type="button" (click)="showReservations(match)">
                {{ selectedMatchId() === match.id ? '🙈 Masquer' : '👁 Voir détails' }}
              </button>
              <button
                class="adm-match-btn-convert"
                type="button"
                (click)="convertToPublic(match.id)"
                [disabled]="match.typeMatch !== 'PRIVE'"
              >
                🌐 Convertir en public
              </button>
            </mat-card-actions>
          </mat-card>
        } @empty {
          <div class="adm-match-empty lg:col-span-2">
            <span>🎾</span>
            <p>Aucun match disponible</p>
          </div>
        }
      </div>
    </section>

    <style>
      .adm-match-header {
        background: linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 16px rgba(194,65,12,0.3);
      }
      .adm-match-header-inner {
        display: flex; align-items: center; justify-content: space-between;
        max-width: 1200px; margin: 0 auto; gap: 1rem;
      }
      .adm-match-title-block { display: flex; align-items: center; gap: 1rem; }
      .adm-match-icon { font-size: 2.5rem; }
      .adm-match-title { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
      .adm-match-sub { color: rgba(255,255,255,0.75); font-size: 0.85rem; margin: 0; }
      .adm-match-back-btn {
        background: rgba(255,255,255,0.15); color: #fff; border: 2px solid rgba(255,255,255,0.35);
        border-radius: 9999px; padding: 0.45rem 1.1rem; font-weight: 700;
        font-size: 0.85rem; text-decoration: none; transition: background 0.15s;
        white-space: nowrap;
      }
      .adm-match-back-btn:hover { background: rgba(255,255,255,0.25); }

      .adm-match-card {
        border-radius: 1.25rem !important;
        border: 1px solid rgba(234,88,12,0.15) !important;
        overflow: hidden;
        border-top: 4px solid #ea580c !important;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .adm-match-card:hover { transform: translateY(-3px); }

      .adm-match-card-header { padding: 1rem 1.25rem 0 !important; }
      .adm-match-card-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.5rem; }
      .adm-match-card-title { font-size: 1.05rem !important; font-weight: 700 !important; color: #1e293b !important; }
      .adm-match-card-sub { color: #64748b !important; }
      .adm-match-date-row { display: flex; gap: 1rem; font-size: 0.82rem; color: #94a3b8; padding-bottom: 0.5rem; flex-wrap: wrap; }

      .adm-match-content { padding: 0.75rem 1.25rem !important; }
      .adm-match-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
      .adm-info-item { display: flex; flex-direction: column; gap: 0.2rem; }
      .adm-players-item { grid-column: 1 / -1; }
      .adm-info-label { font-size: 0.72rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
      .adm-info-value { font-size: 0.9rem; font-weight: 600; color: #1e293b; }

      .adm-players-bar {
        background: #f1f5f9; border-radius: 9999px; height: 1.25rem;
        overflow: hidden; border: 1px solid #e2e8f0; margin-top: 0.2rem;
      }
      .adm-players-fill {
        height: 100%; background: linear-gradient(90deg, #f97316, #ea580c);
        border-radius: 9999px; display: flex; align-items: center;
        justify-content: center; min-width: 2rem;
        font-size: 0.7rem; font-weight: 700; color: #fff;
        transition: width 0.4s ease;
      }

      .adm-reservations-panel {
        margin-top: 0.75rem; border-radius: 0.75rem;
        border: 1px solid #fed7aa; background: #fff7ed; padding: 0.75rem;
      }
      .adm-reservations-title { font-weight: 700; color: #9a3412; font-size: 0.9rem; margin: 0 0 0.5rem; }
      .adm-reservation-item {
        display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;
        padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: #fff;
        margin-bottom: 0.4rem; font-size: 0.85rem; border: 1px solid #fed7aa;
      }

      .adm-match-actions {
        display: flex; flex-wrap: wrap; gap: 0.75rem;
        padding: 0.75rem 1.25rem 1rem !important;
        border-top: 1px solid #fef0e6;
      }
      .adm-match-btn-details {
        flex: 1; min-width: 130px; padding: 0.5rem 1rem; border-radius: 0.6rem;
        background: #fff7ed; color: #9a3412; border: 1.5px solid #fed7aa;
        font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: background 0.15s;
      }
      .adm-match-btn-details:hover { background: #ffedd5; }
      .adm-match-btn-convert {
        flex: 1; min-width: 160px; padding: 0.5rem 1rem; border-radius: 0.6rem;
        background: linear-gradient(135deg, #0369a1, #2563eb); color: #fff; border: none;
        font-weight: 700; font-size: 0.85rem; cursor: pointer;
        box-shadow: 0 3px 10px rgba(37,99,235,0.3); transition: transform 0.15s;
      }
      .adm-match-btn-convert:hover:not(:disabled) { transform: translateY(-1px); }
      .adm-match-btn-convert:disabled { opacity: 0.4; cursor: not-allowed; }

      .adm-match-empty {
        text-align: center; padding: 3rem; color: #94a3b8;
        font-size: 1.1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      }
      .adm-match-empty span { font-size: 3rem; }
    </style>
  `
})
export class AdminMatchesPage {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly reservationsApi = inject(ReservationsApiService);
  private readonly sitesApi = inject(SitesApiService);
  private readonly adminSession = inject(AdminSessionService);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly matches = signal<MatchResponse[]>([]);
  readonly sites = signal<SiteResponse[]>([]);
  readonly selectedMatchId = signal<number | null>(null);
  readonly selectedReservations = signal<ReservationResponse[]>([]);

  readonly filteredMatches = computed(() => {
    if (this.adminSession.isGlobalAdmin()) {
      return this.matches();
    }
    const siteNames = new Set(this.sites().map((site) => site.nom));
    return this.matches().filter((match) => siteNames.has(match.siteNom));
  });

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      matches: this.matchesApi.getAll(),
      sites: this.sitesApi.getAll()
    }).subscribe({
      next: ({ matches, sites }) => {
        this.matches.set(matches);
        this.sites.set(this.adminSession.isGlobalAdmin() ? sites : sites.filter((site) => site.id === this.adminSession.siteId()));
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les matchs admin.'));
      }
    });
  }

  showReservations(match: MatchResponse): void {
    if (this.selectedMatchId() === match.id) {
      this.selectedMatchId.set(null);
      this.selectedReservations.set([]);
      return;
    }

    this.selectedMatchId.set(match.id);
    this.reservationsApi.getByMatch(match.id).subscribe({
      next: (reservations) => this.selectedReservations.set(reservations),
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les réservations du match.'));
      }
    });
  }

  convertToPublic(matchId: number): void {
    this.message.set('');
    this.errorMessage.set('');

    this.matchesApi.convertToPublic(matchId).subscribe({
      next: () => {
        this.message.set('Match converti en public.');
        this.loadData();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Conversion impossible.'));
      }
    });
  }

  typeBadgeClass(type: MatchResponse['typeMatch']): string {
    return type === 'PRIVE' ? 'ds-badge-info' : 'ds-badge-neutral';
  }

  statusBadgeClass(statut: MatchResponse['statut']): string {
    if (statut === 'PLANIFIE') {
      return 'ds-badge-success';
    }
    if (statut === 'COMPLET') {
      return 'ds-badge-warning';
    }
    return 'ds-badge-danger';
  }

  reservationBadgeClass(statut: ReservationResponse['statut']): string {
    if (statut === 'CONFIRMEE') {
      return 'ds-badge-success';
    }
    if (statut === 'EN_ATTENTE') {
      return 'ds-badge-warning';
    }
    return 'ds-badge-danger';
  }

  paymentBadgeClass(statut: string | undefined): string {
    if (statut === 'PAYE') {
      return 'ds-badge-success';
    }
    if (statut === 'EN_ATTENTE') {
      return 'ds-badge-warning';
    }
    if (statut === 'REMBOURSE') {
      return 'ds-badge-info';
    }
    return 'ds-badge-neutral';
  }
}
