import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { TerrainsApiService } from '../../../core/api/terrains-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { TypeMembre } from '../../../shared/models/enums.model';
import { MatchResponse } from '../../../shared/models/match.model';
import { MembreResponse } from '../../../shared/models/membre.model';
import { SiteResponse, TerrainResponse } from '../../../shared/models/site-terrain.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

const BOOKING_MAX_DAYS: Record<TypeMembre, number> = {
  GLOBAL: 21,
  SITE: 14,
  LIBRE: 5
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMaxBookingDays = (memberType?: TypeMembre | null): number => BOOKING_MAX_DAYS[memberType ?? 'LIBRE'];

const createMaxBookingDateValidator = (getMaxDate: () => string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = `${control.value ?? ''}`.trim();
    if (!value) {
      return null;
    }

    const maxDate = getMaxDate();
    return value > maxDate ? { maxBookingDate: { maxDate, actualDate: value } } : null;
  };
};

@Component({
  selector: 'app-member-create-match-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page-shell max-w-6xl">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="title-gradient ds-section-title">Créer un match</h1>
          <p class="ds-subtitle">Public ou privé, selon les règles du backend.</p>
          <span class="ds-badge"
                [class]="form.controls.typeMatch.value === 'PRIVE' ? 'ds-badge-info' : 'ds-badge-success'">
            Mode création : {{ form.controls.typeMatch.value }}
          </span>
        </div>
        <div class="toolbar-actions">
          <a mat-stroked-button routerLink="/member/matches">Retour aux matchs publics</a>
        </div>
      </div>

      <mat-card class="card-soft panel-gradient">
        <mat-card-content>
          <form [formGroup]="form" class="grid gap-4 pt-4 md:grid-cols-2" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Site</mat-label>
              <mat-select formControlName="siteId" (valueChange)="onSiteChange($event)" [disabled]="isSiteMember()">
                @for (site of sites(); track site.id) {
                  <mat-option [value]="site.id">{{ site.nom }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Terrain</mat-label>
              <mat-select formControlName="terrainId" [disabled]="!terrains().length">
                @for (terrain of terrains(); track terrain.id) {
                  <mat-option [value]="terrain.id">{{ terrain.nom }}{{ terrain.prix != null ? ' - ' + terrain.prix + ' EUR' : '' }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput type="date" formControlName="date" [min]="todayDate()" [max]="maxBookingDate()" />
              <mat-hint>Entre {{ todayDate() }} et {{ maxBookingDate() }}</mat-hint>
              @if (form.controls.date.hasError('maxBookingDate') && (form.controls.date.dirty || form.controls.date.touched)) {
                <mat-error>{{ bookingDelayErrorMessage() }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Heure début</mat-label>
              <input matInput type="time" formControlName="heureDebut" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type de match</mat-label>
              <mat-select formControlName="typeMatch">
                <mat-option value="PUBLIC">PUBLIC</mat-option>
                <mat-option value="PRIVE">PRIVÉ</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:col-span-2">
              <p class="font-semibold text-slate-800">Rappel</p>
              <ul class="ml-4 list-disc space-y-1">
                <li>GLOBAL : jusqu'à 3 semaines à l'avance</li>
                <li>SITE : jusqu'à 2 semaines à l'avance sur son site</li>
                <li>LIBRE : jusqu'à 5 jours à l'avance</li>
              </ul>
              <p class="mt-2 text-slate-500">Dernière date autorisée selon votre profil : {{ maxBookingDate() }}</p>
            </div>

            @if (errorMessage()) {
              <p class="status-error md:col-span-2">{{ errorMessage() }}</p>
            } @else if (!sites().length && !loading()) {
              <p class="status-info md:col-span-2">Aucun site disponible pour créer un match.</p>
            }

            @if (form.controls.siteId.value && !terrains().length && !loading()) {
              <p class="status-info md:col-span-2">Aucun terrain disponible pour le site sélectionné.</p>
            }

            @if (form.controls.typeMatch.value === 'PRIVE') {
              <div class="md:col-span-2">
                <p class="mb-2 text-sm font-medium text-slate-800">Joueurs a inviter maintenant (optionnel)</p>
                <div class="grid gap-3 md:grid-cols-3">
                  <mat-form-field appearance="outline">
                    <mat-label>Matricule joueur 2</mat-label>
                    <input matInput formControlName="player1" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Matricule joueur 3</mat-label>
                    <input matInput formControlName="player2" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Matricule joueur 4</mat-label>
                    <input matInput formControlName="player3" />
                  </mat-form-field>
                </div>
              </div>
            }

            @if (message()) {
              <p class="status-success md:col-span-2">{{ message() }}</p>
            }

            <div class="toolbar-actions justify-start md:col-span-2">
              <button mat-flat-button color="primary" type="submit" [disabled]="loading() || form.invalid || !terrains().length">
                Créer le match
              </button>
              <a mat-stroked-button routerLink="/member/profile">Retour profil</a>
              @if (loading()) {
                <mat-spinner diameter="24"></mat-spinner>
              }
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </section>
  `
})
export class MemberCreateMatchPage {
  private readonly sitesApi = inject(SitesApiService);
  private readonly terrainsApi = inject(TerrainsApiService);
  private readonly matchesApi = inject(MatchesApiService);
  private readonly membresApi = inject(MembresApiService);
  private readonly reservationsApi = inject(ReservationsApiService);
  private readonly memberSession = inject(MemberSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly sites = signal<SiteResponse[]>([]);
  readonly terrains = signal<TerrainResponse[]>([]);
  readonly member = computed(() => this.memberSession.member());
  readonly isSiteMember = computed(() => this.member()?.typeMembre === 'SITE');
  readonly todayDate = computed(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return formatDateForInput(today);
  });
  readonly maxBookingDate = computed(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    today.setDate(today.getDate() + getMaxBookingDays(this.member()?.typeMembre));
    return formatDateForInput(today);
  });
  readonly bookingDelayErrorMessage = computed(() => {
    const memberType = this.member()?.typeMembre ?? 'LIBRE';
    return `Le profil ${memberType} ne peut pas réserver plus de ${getMaxBookingDays(memberType)} jours à l'avance. Dernière date autorisée : ${this.maxBookingDate()}.`;
  });

  readonly form = new FormGroup({
    siteId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    terrainId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, createMaxBookingDateValidator(() => this.maxBookingDate())]
    }),
    heureDebut: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    typeMatch: new FormControl<'PUBLIC' | 'PRIVE'>('PUBLIC', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    player1: new FormControl('', { nonNullable: true }),
    player2: new FormControl('', { nonNullable: true }),
    player3: new FormControl('', { nonNullable: true })
  });

  constructor() {
    if (!this.memberSession.isAuthenticated()) {
      this.router.navigateByUrl('/member');
      return;
    }

    this.applyPreferredTypeFromQuery();
    this.applyDefaultStartTime();
    this.applyDateBounds();
    this.loadSites();
  }

  private applyDefaultStartTime(): void {
    if (!this.form.controls.heureDebut.value) {
      this.form.controls.heureDebut.setValue('09:00');
    }
  }

  private applyPreferredTypeFromQuery(): void {
    const preferredType = this.route.snapshot.queryParamMap.get('type')?.toUpperCase();
    if (preferredType === 'PUBLIC' || preferredType === 'PRIVE') {
      this.form.controls.typeMatch.setValue(preferredType);
    }
  }

  loadSites(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.sitesApi.getAll().subscribe({
      next: (sites) => {
        this.sites.set(sites);
        const member = this.member();
        if (member?.typeMembre === 'SITE' && member.siteId) {
          this.form.controls.siteId.setValue(member.siteId);
          this.onSiteChange(member.siteId);
          return;
        }

        if (sites.length) {
          const defaultSiteId = sites[0].id;
          this.form.controls.siteId.setValue(defaultSiteId);
          this.onSiteChange(defaultSiteId);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les sites.'));
        this.loading.set(false);
      }
    });
  }

  onSiteChange(siteId: number | null): void {
    this.form.controls.terrainId.setValue(null);
    this.terrains.set([]);

    if (!siteId) {
      return;
    }

    this.loading.set(true);
    this.terrainsApi.getBySite(siteId).subscribe({
      next: (terrains) => {
        this.terrains.set(terrains);
        if (terrains.length) {
          this.form.controls.terrainId.setValue(terrains[0].id);
        }
        this.loading.set(false);
      },
      error: (error) => {
        const status = error?.status;
        if (status === 404) {
          this.errorMessage.set('Site introuvable.');
        } else if (status === 500) {
          this.errorMessage.set('Erreur serveur lors du chargement des terrains.');
        } else {
          this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les terrains.'));
        }
        this.terrains.set([]);
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.loading()) {
      if (this.form.controls.date.hasError('maxBookingDate')) {
        this.errorMessage.set(this.bookingDelayErrorMessage());
      }
      return;
    }

    const { terrainId, date, heureDebut, typeMatch } = this.form.getRawValue();

    if (!terrainId) {
      this.errorMessage.set('Veuillez sélectionner un terrain.');
      return;
    }

    if (typeMatch !== 'PUBLIC' && typeMatch !== 'PRIVE') {
      this.errorMessage.set('Le type de match est invalide.');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.errorMessage.set('');

    const matchDate = `${date}T${heureDebut}:00`;

    const payload: import('../../../shared/models/match.model').CreateMatchRequest = {
      terrainId,
      matchDate,
      matchType: typeMatch
    };

    this.matchesApi.create(payload).subscribe({
      next: (createdMatch) => {
        this.handleInvites(createdMatch, this.member()!);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(this.toFriendlyCreationErrorMessage(error));
      }
    });
  }

  private applyDateBounds(): void {
    const dateControl = this.form.controls.date;
    const minDate = this.todayDate();
    const maxDate = this.maxBookingDate();
    const selectedDate = dateControl.getRawValue();

    if (!selectedDate || selectedDate < minDate) {
      dateControl.setValue(minDate);
    } else if (selectedDate > maxDate) {
      dateControl.setValue(maxDate);
    }

    dateControl.updateValueAndValidity({ emitEvent: false });
  }

  private toFriendlyCreationErrorMessage(error: unknown): string {
    const apiMessage = extractApiErrorMessage(error, 'Création du match impossible.');
    const status = (error as any)?.status || (error as any)?.error?.status;

    const errorMappings: Record<string, string> = {
      'outstanding balance': 'Vous avez un solde impayé. Réglez vos dettes avant de créer un match.',
      'active penalty': 'Vous avez une pénalité active. Attendez avant de créer un match.',
      'ne peut pas reserver plus de': this.bookingDelayErrorMessage(),
      'ce créneau est déjà réservé': 'Ce créneau est déjà réservé. Choisissez un autre horaire.',
      'site est fermé': 'Le site est fermé à cette date.',
      'en dehors des heures d\'ouverture': "Cet horaire est en dehors des heures d'ouverture du site.",
      'ne peut créer un match que sur son propre site': 'Un membre SITE ne peut créer un match que sur son propre site.'
    };

    const normalizedMessage = apiMessage
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/ã©/g, 'e')
      .replace(/ã¨/g, 'e')
      .replace(/ãª/g, 'e')
      .replace(/ã /g, 'a');
    for (const [key, message] of Object.entries(errorMappings)) {
      const normalizedKey = key
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
      if (normalizedMessage.includes(normalizedKey)) {
        return message;
      }
    }

    if (status === 500) {
      return 'Une erreur interne du serveur est survenue lors de la création du match.';
    }

    return apiMessage;
  }

  private handleInvites(createdMatch: MatchResponse, organiser: MembreResponse): void {
    const invitees = [
      this.form.controls.player1.getRawValue(),
      this.form.controls.player2.getRawValue(),
      this.form.controls.player3.getRawValue()
    ]
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);

    if (this.form.controls.typeMatch.getRawValue() !== 'PRIVE' || !invitees.length) {
      this.loading.set(false);
      this.message.set('Match créé. Votre place sera confirmée après paiement depuis vos réservations.');
      setTimeout(() => this.router.navigateByUrl('/member/reservations'), 1000);
      return;
    }

    forkJoin(invitees.map((matricule) => this.membresApi.getByMatricule(matricule))).subscribe({
      next: (members) => this.createReservationsForInvites(createdMatch.id, organiser.id, members),
      error: (error) => {
        this.loading.set(false);
        this.message.set('Match créé, mais au moins un joueur invité est introuvable.');
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible d\'ajouter tous les joueurs.'));
        setTimeout(() => this.router.navigateByUrl('/member/reservations'), 2000);
      }
    });
  }

  private createReservationsForInvites(matchId: number, organiserId: number, members: MembreResponse[]): void {
    forkJoin(
      members.map((member) =>
        this.reservationsApi.create({
          matchId,
          membreId: member.id,
          requesterId: organiserId
        })
      )
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Match privé créé. Les invitations sont en attente de paiement des joueurs.');
        setTimeout(() => this.router.navigateByUrl('/member/reservations'), 1000);
      },
      error: (error) => {
        this.loading.set(false);
        this.message.set("Match créé, mais certains joueurs n'ont pas pu être ajoutés.");
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible d\'ajouter tous les joueurs.'));
        setTimeout(() => this.router.navigateByUrl('/member/reservations'), 2000);
      }
    });
  }
}
