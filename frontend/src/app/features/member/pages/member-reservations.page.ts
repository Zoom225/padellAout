import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { PaiementsApiService } from '../../../core/api/paiements-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { MatchResponse } from '../../../shared/models/match.model';
import { ReservationResponse } from '../../../shared/models/reservation.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-member-reservations-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page-shell">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="title-gradient ds-section-title">Mes réservations</h1>
          <p class="ds-subtitle">Paiement et annulation de vos inscriptions.</p>
        </div>
        <div class="toolbar-actions">
          <a mat-flat-button color="primary" routerLink="/member/matches/new" [queryParams]="{ type: 'PUBLIC' }">Créer un match PUBLIC</a>
          <a mat-flat-button color="accent" routerLink="/member/matches/new" [queryParams]="{ type: 'PRIVE' }">Créer un match PRIVÉ</a>
          <a mat-stroked-button routerLink="/member/matches">Matchs publics</a>
          <a mat-stroked-button routerLink="/member/payments">Mes paiements</a>
        </div>
      </div>

      @if (loading()) {
        <mat-spinner diameter="32"></mat-spinner>
      }

      @if (message()) {
        <p class="status-success">{{ message() }}</p>
      }

      @if (errorMessage()) {
        <p class="status-error">{{ errorMessage() }}</p>
      }

      <mat-card class="card-soft panel-gradient">
        <mat-card-header>
          <mat-card-title>🎾 Mes matchs organisés</mat-card-title>
          <mat-card-subtitle>Modifier, supprimer ou gérer les joueurs de vos matchs.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="grid gap-4 md:grid-cols-3">
          <mat-form-field appearance="outline">
            <mat-label>Sélectionner un match organisé</mat-label>
            <mat-select [value]="managedMatchId()" (valueChange)="onManagedMatchChange($event)">
              <mat-option [value]="null">-- Choisir un match --</mat-option>
              @for (match of managedMatches(); track match.id) {
                <mat-option [value]="match.id">
                  #{{ match.id }} – {{ match.date }} {{ match.heureDebut }} [{{ match.typeMatch }}]
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (selectedManagedMatch()?.typeMatch === 'PRIVE') {
            <mat-form-field appearance="outline">
              <mat-label>Matricule joueur à ajouter</mat-label>
              <input matInput [formControl]="inviteMatricule" placeholder="Ex: G1002" />
            </mat-form-field>

            <div class="flex items-end gap-2">
              <button
                mat-flat-button
                color="primary"
                type="button"
                (click)="addPlayer()"
                [disabled]="!selectedManagedMatch() || inviteMatricule.invalid || actionId() !== null"
              >
                Ajouter joueur
              </button>
            </div>
          }

          @if (!managedMatches().length) {
            <div class="md:col-span-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              ✅ Aucun match organisé pour l'instant. Créez un match PUBLIC ou PRIVÉ via les boutons ci-dessus.
            </div>
          }

          @if (selectedManagedMatch()) {
            <div class="md:col-span-3 rounded-lg border border-slate-200 bg-white p-4">
              <p class="mb-3 text-sm font-semibold text-slate-800">
                ✏️ Modifier le match #{{ selectedManagedMatch()!.id }}
                <span class="ml-2 ds-badge" [class]="typeBadgeClass(selectedManagedMatch()!.typeMatch)">
                  {{ selectedManagedMatch()!.typeMatch }}
                </span>
              </p>
              <form [formGroup]="managedMatchForm" class="grid gap-3 md:grid-cols-4" (ngSubmit)="updateManagedMatch()">
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput type="date" formControlName="date" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Heure début</mat-label>
                  <input matInput type="time" formControlName="heureDebut" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="typeMatch">
                    <mat-option value="PRIVE">PRIVÉ</mat-option>
                    <mat-option value="PUBLIC">PUBLIC</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="flex items-end gap-2">
                  <button mat-flat-button color="primary" type="submit" [disabled]="managedMatchForm.invalid || actionId() !== null">
                    💾 Enregistrer
                  </button>
                  <button mat-stroked-button color="warn" type="button" (click)="requestDeleteManagedMatch()" [disabled]="actionId() !== null">
                    🗑️ Supprimer
                  </button>
                </div>
              </form>

              @if (pendingDeleteMatchId() === selectedManagedMatch()!.id) {
                <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <p class="font-semibold">Confirmation requise</p>
                  <p class="mt-1">Ce match sera annulé et masqué de votre historique.</p>
                  <div class="mt-3 flex gap-2">
                    <button mat-flat-button color="warn" type="button" (click)="deleteManagedMatch()" [disabled]="actionId() !== null">Confirmer la suppression</button>
                    <button mat-stroked-button type="button" (click)="cancelDeleteManagedMatch()" [disabled]="actionId() !== null">Annuler</button>
                  </div>
                </div>
              }
            </div>
          }

          <div class="md:col-span-3">
            @if (managedReservations().length) {
              <p class="mb-2 text-sm font-semibold text-slate-700">Joueurs inscrits :</p>
              <div class="grid gap-2 md:grid-cols-2">
                @for (res of managedReservations(); track res.id) {
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-800">{{ res.membreNom }}</p>
                      <p class="mt-1 flex flex-wrap gap-1 text-xs">
                        <span class="ds-badge" [class]="reservationBadgeClass(res.statut)">Réservation: {{ res.statut }}</span>
                        <span class="ds-badge" [class]="paymentBadgeClass(res.paiement?.statut)">Paiement: {{ res.paiement?.statut || 'N/A' }}</span>
                      </p>
                    </div>
                    @if (selectedManagedMatch()?.typeMatch === 'PRIVE') {
                      <button
                        mat-stroked-button
                        color="warn"
                        type="button"
                        (click)="removePlayer(res)"
                        [disabled]="actionId() === res.id || res.statut === 'ANNULEE' || res.membreId === memberId()"
                      >
                        Retirer
                      </button>
                    }
                  </div>
                }
              </div>
            } @else if (selectedManagedMatch()) {
              <p class="text-sm text-slate-500 italic">Aucun joueur inscrit sur ce match.</p>
            }
          </div>
        </mat-card-content>
      </mat-card>

      <div class="grid gap-4 lg:grid-cols-2">
        @for (reservation of reservations(); track reservation.id) {
          <mat-card class="card-soft">
            <mat-card-header>
              <mat-card-title>📋 Réservation #{{ reservation.id }}</mat-card-title>
              <mat-card-subtitle>{{ reservation.matchDateTime }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="ds-data-list">
              <div class="ds-data-row"><span class="ds-data-key">Joueur</span><span class="ds-data-value">{{ reservation.membreNom }}</span></div>
              <div class="ds-data-row"><span class="ds-data-key">Match</span><span class="ds-data-value">#{{ reservation.matchId }}</span></div>
              <div class="ds-data-row"><span class="ds-data-key">Réservation</span><span class="ds-data-value"><span class="ds-badge" [class]="reservationBadgeClass(reservation.statut)">{{ reservation.statut }}</span></span></div>
              <div class="ds-data-row"><span class="ds-data-key">Paiement</span><span class="ds-data-value"><span class="ds-badge" [class]="paymentBadgeClass(reservation.paiement?.statut)">{{ reservation.paiement?.statut || 'N/A' }}</span></span></div>
              <div class="ds-data-row"><span class="ds-data-key">Montant</span><span class="ds-data-value">{{ reservation.paiement?.montant ?? 0 }} €</span></div>
            </mat-card-content>
            <mat-card-actions>
              <button
                mat-flat-button
                color="primary"
                type="button"
                (click)="pay(reservation)"
                [disabled]="reservation.statut === 'ANNULEE' || reservation.paiement?.statut !== 'EN_ATTENTE' || actionId() === reservation.id"
              >
                💳 Payer
              </button>
              <button
                mat-stroked-button
                color="warn"
                type="button"
                (click)="cancel(reservation)"
                [disabled]="reservation.statut === 'ANNULEE' || actionId() === reservation.id"
              >
                ❌ Annuler
              </button>
            </mat-card-actions>
          </mat-card>
        } @empty {
          @if (!loading()) {
            <mat-card>
              <mat-card-content class="py-6 text-slate-600">
                <p>Aucune réservation trouvée.</p>
                <p class="mt-2 text-sm text-slate-400">Créez un match ou rejoignez un match public pour voir vos réservations ici.</p>
              </mat-card-content>
            </mat-card>
          }
        }
      </div>
    </section>
  `
})
export class MemberReservationsPage {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly membresApi = inject(MembresApiService);
  private readonly reservationsApi = inject(ReservationsApiService);
  private readonly paiementsApi = inject(PaiementsApiService);
  private readonly memberSession = inject(MemberSessionService);

  readonly loading = signal(false);
  readonly actionId = signal<number | null>(null);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly reservations = signal<ReservationResponse[]>([]);
  readonly organisedMatches = signal<MatchResponse[]>([]);
  // Ne retourne que les matchs PRIVE pour la gestion des joueurs
  readonly managedMatches = computed(() => this.organisedMatches().filter((m) => m.typeMatch === 'PRIVE'));
  readonly selectedManagedMatch = computed(() => {
    const matchId = this.managedMatchId();
    if (!matchId) {
      return null;
    }
    return this.managedMatches().find((match) => match.id === matchId) ?? null;
  });
  readonly managedReservations = signal<ReservationResponse[]>([]);
  readonly managedMatchId = signal<number | null>(null);
  readonly pendingDeleteMatchId = signal<number | null>(null);
  readonly managedMatchForm = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    heureDebut: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    typeMatch: new FormControl<'PUBLIC' | 'PRIVE'>('PRIVE', { nonNullable: true, validators: [Validators.required] })
  });
  readonly inviteMatricule = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^(G\d{4}|S\d{5}|L\d{5})$/)]
  });
  readonly memberId = computed(() => this.memberSession.memberId());

  constructor() {
    this.loadReservations();
    this.loadOrganisedMatches();
  }

  loadReservations(): void {
    const memberId = this.memberId();
    if (!memberId) {
      this.errorMessage.set('Aucun membre connecté.');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.errorMessage.set('');
    this.reservationsApi.getByMembre(memberId).subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les réservations.'));
      }
    });
  }

  loadOrganisedMatches(): void {
    const memberId = this.memberId();
    if (!memberId) {
      return;
    }

    this.matchesApi.getByOrganisateur(memberId).subscribe({
      next: (matches) => {
        this.organisedMatches.set(matches.filter((match) => match.statut !== 'ANNULE'));
        if (this.managedMatchId() && !this.selectedManagedMatch()) {
          this.managedMatchId.set(null);
          this.managedReservations.set([]);
          this.managedMatchForm.reset({ date: '', heureDebut: '', typeMatch: 'PRIVE' });
        } else {
          this.syncManagedMatchForm();
        }
      },
      error: () => {
        // On garde la page utilisable même si ce chargement échoue.
      }
    });
  }

  onManagedMatchChange(matchId: number | null): void {
    // On bloque la sélection d'un match PUBLIC
    const match = this.organisedMatches().find((m) => m.id === matchId) ?? null;
    if (match && match.typeMatch !== 'PRIVE') {
      this.errorMessage.set('La gestion des joueurs est réservée aux matchs PRIVÉS.');
      this.managedMatchId.set(null);
      this.managedReservations.set([]);
      this.pendingDeleteMatchId.set(null);
      return;
    }

    this.managedMatchId.set(matchId);
    this.managedReservations.set([]);
    this.pendingDeleteMatchId.set(null);

    if (!matchId) {
      this.managedMatchForm.reset({ date: '', heureDebut: '', typeMatch: 'PRIVE' });
      return;
    }

    this.syncManagedMatchForm();

    this.reservationsApi.getByMatch(matchId).subscribe({
      next: (reservations) => this.managedReservations.set(reservations),
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les joueurs du match.'));
      }
    });
  }

  updateManagedMatch(): void {
    const selectedMatch = this.selectedManagedMatch();
    const requesterId = this.memberId();
    if (!selectedMatch || !requesterId || this.managedMatchForm.invalid || this.actionId() !== null) {
      return;
    }

    this.actionId.set(selectedMatch.id);
    this.message.set('');
    this.errorMessage.set('');

    this.matchesApi
      .update(selectedMatch.id, {
        terrainId: selectedMatch.terrainId,
        organisateurId: requesterId,
        date: this.managedMatchForm.controls.date.getRawValue(),
        heureDebut: this.managedMatchForm.controls.heureDebut.getRawValue(),
        typeMatch: this.managedMatchForm.controls.typeMatch.getRawValue()
      })
      .subscribe({
        next: (updatedMatch) => {
          this.actionId.set(null);
        this.message.set('Match mis à jour avec succès.');
          this.organisedMatches.update((matches) => matches.map((match) => (match.id === updatedMatch.id ? updatedMatch : match)));

          if (updatedMatch.typeMatch !== 'PRIVE') {
            this.managedMatchId.set(null);
            this.managedReservations.set([]);
            this.managedMatchForm.reset({ date: '', heureDebut: '', typeMatch: 'PRIVE' });
          } else {
            this.syncManagedMatchForm();
            this.onManagedMatchChange(updatedMatch.id);
          }
        },
        error: (error) => {
          this.actionId.set(null);
          this.errorMessage.set(extractApiErrorMessage(error, 'Modification du match impossible.'));
        }
      });
  }

  requestDeleteManagedMatch(): void {
    const selectedMatch = this.selectedManagedMatch();
    if (!selectedMatch) {
      return;
    }

    this.pendingDeleteMatchId.set(selectedMatch.id);
    this.message.set('');
    this.errorMessage.set('');
  }

  cancelDeleteManagedMatch(): void {
    this.pendingDeleteMatchId.set(null);
  }

  deleteManagedMatch(): void {
    const selectedMatch = this.selectedManagedMatch();
    const requesterId = this.memberId();
    if (!selectedMatch || !requesterId || this.actionId() !== null) {
      return;
    }
    // Sécurité : on ne supprime qu'un match PRIVÉ
    if (selectedMatch.typeMatch !== 'PRIVE') {
      this.errorMessage.set('Seuls les matchs PRIVÉS peuvent être annulés ici.');
      return;
    }
    if (this.pendingDeleteMatchId() !== selectedMatch.id) {
      return;
    }

    this.actionId.set(selectedMatch.id);
    this.message.set('');
    this.errorMessage.set('');

    this.matchesApi.cancel(selectedMatch.id, requesterId).subscribe({
      next: () => {
        this.actionId.set(null);
        this.pendingDeleteMatchId.set(null);
        this.message.set('Match annulé avec succès.');
        this.managedMatchId.set(null);
        this.managedReservations.set([]);
        this.managedMatchForm.reset({ date: '', heureDebut: '', typeMatch: 'PRIVE' });
        // Recharge la liste pour garantir l'appel au mock dans le test
        this.matchesApi.getByOrganisateur(requesterId).subscribe({
          next: (matches) => this.organisedMatches.set(matches.filter((m) => m.statut !== 'ANNULE')),
          complete: () => this.loadReservations()
        });
      },
      error: (error) => {
        this.actionId.set(null);
        this.pendingDeleteMatchId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Suppression du match impossible.'));
      }
    });
  }

  private syncManagedMatchForm(): void {
    const selectedMatch = this.selectedManagedMatch();
    if (!selectedMatch) {
      return;
    }

    this.managedMatchForm.patchValue(
      {
        date: selectedMatch.date,
        heureDebut: selectedMatch.heureDebut.slice(0, 5),
        typeMatch: selectedMatch.typeMatch
      },
      { emitEvent: false }
    );
  }

  addPlayer(): void {
    const requesterId = this.memberId();
    const matchId = this.managedMatchId();
    if (!requesterId || !matchId || !this.selectedManagedMatch() || this.inviteMatricule.invalid || this.actionId() !== null) {
      return;
    }

    const matricule = this.inviteMatricule.getRawValue().trim().toUpperCase();
    this.actionId.set(-1);
    this.message.set('');
    this.errorMessage.set('');

    this.membresApi.getByMatricule(matricule).subscribe({
      next: (member) => {
        this.reservationsApi
          .create({
            matchId,
            membreId: member.id,
            requesterId
          })
          .subscribe({
            next: () => {
              this.actionId.set(null);
              this.inviteMatricule.setValue('');
              this.message.set('Joueur ajouté avec succès.');
              this.onManagedMatchChange(matchId);
              this.loadReservations();
            },
            error: (error) => {
              this.actionId.set(null);
              this.errorMessage.set(extractApiErrorMessage(error, 'Ajout du joueur impossible.'));
            }
          });
      },
      error: (error) => {
        this.actionId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Matricule introuvable.'));
      }
    });
  }

  removePlayer(reservation: ReservationResponse): void {
    const matchId = this.managedMatchId();
    this.actionId.set(reservation.id);
    this.message.set('');
    this.errorMessage.set('');

    this.reservationsApi.cancel(reservation.id).subscribe({
      next: () => {
        this.actionId.set(null);
        this.message.set('Joueur retiré du match.');
        if (matchId) {
          this.onManagedMatchChange(matchId);
        }
        this.loadReservations();
      },
      error: (error) => {
        this.actionId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Suppression du joueur impossible.'));
      }
    });
  }

  pay(reservation: ReservationResponse): void {
    const memberId = this.memberId();
    if (!memberId) {
      return;
    }

    this.actionId.set(reservation.id);
    this.message.set('');
    this.errorMessage.set('');

    this.paiementsApi.pay(reservation.id, memberId).subscribe({
      next: () => {
        this.actionId.set(null);
        this.message.set('Paiement effectué avec succès.');
        this.loadReservations();
      },
      error: (error) => {
        this.actionId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Paiement impossible.'));
      }
    });
  }

  cancel(reservation: ReservationResponse): void {
    this.actionId.set(reservation.id);
    this.message.set('');
    this.errorMessage.set('');

    this.reservationsApi.cancel(reservation.id).subscribe({
      next: () => {
        this.actionId.set(null);
        this.message.set('Réservation annulée.');
        this.loadReservations();
      },
      error: (error) => {
        this.actionId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Annulation impossible.'));
      }
    });
  }

  typeBadgeClass(type: MatchResponse['typeMatch']): string {
    return type === 'PRIVE' ? 'ds-badge-info' : 'ds-badge-success';
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
    if (statut === 'ANNULE') {
      return 'ds-badge-danger';
    }
    return 'ds-badge-neutral';
  }
}
