import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { MatchResponse } from '../../../shared/models/match.model';
import { SiteResponse } from '../../../shared/models/site-terrain.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-member-public-matches-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page-shell">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="title-gradient ds-section-title">Matchs publics</h1>
          <p class="ds-subtitle">Rejoins un match public disponible. Premier payé = premier servi.</p>
        </div>
        <div class="toolbar-actions">
          <a mat-stroked-button routerLink="/member/profile">Mon profil</a>
          <a mat-flat-button color="primary" routerLink="/member/matches/new">Créer un match</a>
        </div>
      </div>

      <mat-card class="card-soft">
        <mat-card-content class="grid gap-4 pt-4 md:grid-cols-3">
          <mat-form-field appearance="outline">
            <mat-label>Filtrer par site</mat-label>
            <mat-select [value]="selectedSiteId()" (valueChange)="selectedSiteId.set($event)">
              <mat-option [value]="0">Tous les sites</mat-option>
              @for (site of sites(); track site.id) {
                <mat-option [value]="site.id">{{ site.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Recherche</mat-label>
            <input
              matInput
              [value]="search()"
              (input)="search.set(($any($event.target)).value)"
              placeholder="Terrain, site, organisateur"
            />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <div class="py-4">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      }

      @if (message()) {
        <p class="status-success">{{ message() }}</p>
      }

      @if (errorMessage()) {
        <p class="status-error">{{ errorMessage() }}</p>
      }

      <a routerLink="/member/matches/new" class="card-soft block rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
        <p class="text-sm font-medium uppercase tracking-wide text-sky-700">Tu ne trouves pas de match ?</p>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xl font-semibold text-slate-900">Créer ton propre match</p>
            <p class="text-sm text-slate-600">En public ou en privé, avec choix du site et du terrain.</p>
          </div>
          <span class="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white">Créer maintenant</span>
        </div>
      </a>

      <div class="grid gap-4 lg:grid-cols-2">
        @for (match of filteredMatches(); track match.id) {
          <mat-card class="card-soft">
            <mat-card-header>
              <mat-card-title>
                {{ match.terrainNom }} - {{ match.siteNom }}
                @if (isOrganizer(match)) {
                  <span class="ml-2 ds-badge ds-badge-info">Mon match</span>
                }
                @if (!isOrganizer(match) && match.nbJoueursActuels >= 4) {
                  <span class="ml-2 ds-badge ds-badge-danger">Complet</span>
                } @else if (!isOrganizer(match) && !canJoin(match)) {
                  <span class="ml-2 ds-badge ds-badge-warning">Non rejoignable</span>
                } @else if (!isOrganizer(match)) {
                  <span class="ml-2 ds-badge ds-badge-success">Disponible</span>
                }
              </mat-card-title>
              <mat-card-subtitle>
                {{ match.date }} · {{ match.heureDebut }} - {{ match.heureFin }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="ds-data-list">
              <div class="ds-data-row"><span class="ds-data-key">Organisateur</span><span class="ds-data-value">{{ match.organisateurNom }}</span></div>
              <div class="ds-data-row"><span class="ds-data-key">Statut</span><span class="ds-data-value"><span class="ds-badge" [class]="statusBadgeClass(match.statut)">{{ match.statut }}</span></span></div>
              <div class="ds-data-row"><span class="ds-data-key">Type</span><span class="ds-data-value"><span class="ds-badge" [class]="typeBadgeClass(match.typeMatch)">{{ match.typeMatch }}</span></span></div>
              <div class="ds-data-row"><span class="ds-data-key">Joueurs</span><span class="ds-data-value">{{ match.nbJoueursActuels }}/4</span></div>
              <div class="ds-data-row"><span class="ds-data-key">Prix par joueur</span><span class="ds-data-value">{{ match.prixParJoueur }} EUR</span></div>
            </mat-card-content>
            <mat-card-actions>
              <button
                mat-flat-button
                color="primary"
                type="button"
                (click)="joinMatch(match)"
                [disabled]="joiningMatchId() === match.id || !canJoin(match)"
              >
                {{ joiningMatchId() === match.id ? 'Réservation...' : 'Rejoindre' }}
              </button>

              @if (isOrganizer(match)) {
                <button mat-stroked-button type="button" (click)="startEdit(match)" [disabled]="!canModify(match) || actionMatchId() === match.id">
                  Modifier
                </button>
                <button mat-stroked-button color="warn" type="button" (click)="cancelOwnMatch(match)" [disabled]="actionMatchId() === match.id">
                  Supprimer
                </button>
              }
            </mat-card-actions>

            @if (isOrganizer(match) && !canModify(match)) {
              <p class="px-4 pb-3 text-xs text-amber-700">Modification indisponible : un match ne peut plus être modifié à moins de 24 h du début.</p>
            }

            @if (editingMatchId() === match.id) {
              <mat-card-content class="grid gap-3 border-t border-slate-100 pt-3 md:grid-cols-4">
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput type="date" [formControl]="editForm.controls.date" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Heure début</mat-label>
                  <input matInput type="time" [formControl]="editForm.controls.heureDebut" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select [formControl]="editForm.controls.typeMatch">
                    <mat-option value="PUBLIC">PUBLIC</mat-option>
                    <mat-option value="PRIVE">PRIVÉ</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="flex items-end gap-2">
                  <button mat-flat-button color="primary" type="button" (click)="saveEdit(match)" [disabled]="editForm.invalid || actionMatchId() === match.id">
                    Enregistrer
                  </button>
                  <button mat-stroked-button type="button" (click)="cancelEdit()" [disabled]="actionMatchId() === match.id">
                    Fermer
                  </button>
                </div>
              </mat-card-content>
            }
          </mat-card>
        } @empty {
          @if (!loading()) {
            <mat-card>
              <mat-card-content class="py-6 text-slate-600">
                Aucun match public ne correspond aux filtres.
              </mat-card-content>
            </mat-card>
          }
        }
      </div>
    </section>
  `
})
export class MemberPublicMatchesPage {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly sitesApi = inject(SitesApiService);
  private readonly reservationsApi = inject(ReservationsApiService);
  private readonly memberSession = inject(MemberSessionService);

  readonly loading = signal(false);
  readonly joiningMatchId = signal<number | null>(null);
  readonly actionMatchId = signal<number | null>(null);
  readonly editingMatchId = signal<number | null>(null);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly matches = signal<MatchResponse[]>([]);
  readonly sites = signal<SiteResponse[]>([]);
  readonly selectedSiteId = signal<number>(0);
  readonly search = signal('');
  readonly editForm = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    heureDebut: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    typeMatch: new FormControl<'PUBLIC' | 'PRIVE'>('PUBLIC', { nonNullable: true, validators: [Validators.required] })
  });

  readonly filteredMatches = computed(() => {
    const siteId = this.selectedSiteId();
    const search = this.search().trim().toLowerCase();

    return this.matches()
      .filter((match) => {
        const matchesSite = !siteId || this.sites().find((site) => site.id === siteId)?.nom === match.siteNom;
        const haystack = `${match.terrainNom} ${match.siteNom} ${match.organisateurNom}`.toLowerCase();
        const matchesSearch = !search || haystack.includes(search);
        return matchesSite && matchesSearch;
      })
      .sort((a, b) => {
        const scoreA = this.isOrganizer(a) ? 0 : 1;
        const scoreB = this.isOrganizer(b) ? 0 : 1;
        return scoreA - scoreB;
      });
  });

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.message.set('');
    this.errorMessage.set('');

    forkJoin({
      matches: this.matchesApi.getPublic(),
      sites: this.sitesApi.getAll()
    }).subscribe({
      next: ({ matches, sites }) => {
        this.matches.set(matches);
        this.sites.set(sites);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les matchs publics.'));
      }
    });
  }

  joinMatch(match: MatchResponse): void {
    const memberId = this.memberSession.memberId();
    if (!memberId) {
      this.errorMessage.set('Aucun membre connecté.');
      return;
    }

    if (!this.canJoin(match)) {
      this.errorMessage.set('Ce match ne peut pas être rejoint (complet, annulé ou non autorisé).');
      return;
    }

    this.joiningMatchId.set(match.id);
    this.message.set('');
    this.errorMessage.set('');

    this.reservationsApi
      .create({
        matchId: match.id,
        membreId: memberId,
        requesterId: memberId
      })
      .subscribe({
        next: () => {
          this.joiningMatchId.set(null);
          this.message.set("Demande créée. Votre place ne sera confirmée qu'après paiement.");
        },
        error: (error) => {
          this.joiningMatchId.set(null);
          this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de réserver ce match.'));
        }
      });
  }

  isOrganizer(match: MatchResponse): boolean {
    return match.organisateurId === this.memberSession.memberId();
  }

  canJoin(match: MatchResponse): boolean {
    if (this.isOrganizer(match)) {
      return false;
    }

    return match.statut === 'PLANIFIE' && match.nbJoueursActuels < 4;
  }

  canModify(match: MatchResponse): boolean {
    return this.isOrganizer(match) && this.startsInMoreThan24Hours(match);
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

  typeBadgeClass(type: MatchResponse['typeMatch']): string {
    return type === 'PRIVE' ? 'ds-badge-info' : 'ds-badge-neutral';
  }

  startEdit(match: MatchResponse): void {
    if (!this.canModify(match)) {
      this.errorMessage.set('Modification impossible à moins de 24 h du début du match.');
      return;
    }

    this.editingMatchId.set(match.id);
    this.editForm.patchValue({
      date: match.date,
      heureDebut: match.heureDebut.slice(0, 5),
      typeMatch: match.typeMatch
    });
  }

  cancelEdit(): void {
    this.editingMatchId.set(null);
  }

  saveEdit(match: MatchResponse): void {
    const memberId = this.memberSession.memberId();
    if (!memberId || this.editForm.invalid) {
      return;
    }

    this.actionMatchId.set(match.id);
    this.message.set('');
    this.errorMessage.set('');

    this.matchesApi
      .update(match.id, {
        terrainId: match.terrainId,
        organisateurId: memberId,
        date: this.editForm.controls.date.getRawValue(),
        heureDebut: this.editForm.controls.heureDebut.getRawValue(),
        typeMatch: this.editForm.controls.typeMatch.getRawValue()
      })
      .subscribe({
        next: () => {
          this.actionMatchId.set(null);
          this.editingMatchId.set(null);
          this.message.set('Match modifié avec succès.');
          this.loadData();
        },
        error: (error) => {
          this.actionMatchId.set(null);
          this.errorMessage.set(extractApiErrorMessage(error, 'Modification du match impossible.'));
        }
      });
  }

  cancelOwnMatch(match: MatchResponse): void {
    const memberId = this.memberSession.memberId();
    if (!memberId) {
      return;
    }

    if (!confirm(`Confirmer la suppression (annulation) du match #${match.id} ?`)) {
      return;
    }

    this.actionMatchId.set(match.id);
    this.message.set('');
    this.errorMessage.set('');

    this.matchesApi.cancel(match.id, memberId).subscribe({
      next: () => {
        this.actionMatchId.set(null);
        this.editingMatchId.set(null);
        this.message.set('Match annulé avec succès.');
        this.loadData();
      },
      error: (error) => {
        this.actionMatchId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Suppression du match impossible.'));
      }
    });
  }

  private startsInMoreThan24Hours(match: MatchResponse): boolean {
    const startDateTime = new Date(`${match.date}T${match.heureDebut}`);
    return startDateTime.getTime() - Date.now() >= 24 * 60 * 60 * 1000;
  }
}
