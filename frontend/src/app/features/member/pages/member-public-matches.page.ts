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
import { LanguageService } from '../../../core/i18n/language.service';
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
          <h1 class="title-gradient ds-section-title">{{ language.t('member.public.title') }}</h1>
          <p class="ds-subtitle">{{ language.t('member.public.subtitle') }}</p>
        </div>
        <div class="toolbar-actions">
          <a mat-stroked-button routerLink="/member/profile">{{ language.t('member.public.myProfile') }}</a>
          <a mat-flat-button color="primary" routerLink="/member/matches/new">{{ language.t('member.public.create') }}</a>
        </div>
      </div>

      <mat-card class="card-soft">
        <mat-card-content class="grid gap-4 pt-4 md:grid-cols-3">
          <mat-form-field appearance="outline">
            <mat-label>{{ language.t('member.public.filter') }}</mat-label>
            <mat-select [value]="selectedSiteId()" (valueChange)="selectedSiteId.set($event)">
              <mat-option [value]="0">{{ language.t('common.allSites') }}</mat-option>
              @for (site of sites(); track site.id) {
                <mat-option [value]="site.id">{{ site.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ language.t('member.public.search') }}</mat-label>
            <input
              matInput
              [value]="search()"
              (input)="search.set(($any($event.target)).value)"
              [placeholder]="language.t('member.public.searchPlaceholder')"
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
        <p class="text-sm font-medium uppercase tracking-wide text-sky-700">{{ language.t('member.public.noMatchPrompt') }}</p>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xl font-semibold text-slate-900">{{ language.t('member.public.create') }}</p>
            <p class="text-sm text-slate-600">{{ language.t('member.public.createBody') }}</p>
          </div>
          <span class="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white">{{ language.t('member.public.create') }}</span>
        </div>
      </a>

      <div class="grid gap-4 lg:grid-cols-2">
        @for (match of filteredMatches(); track match.id) {
          <mat-card class="card-soft">
            <mat-card-header>
              <mat-card-title>
                {{ match.terrainNom }} - {{ match.siteNom }}
                @if (isOrganizer(match)) {
                  <span class="ml-2 ds-badge ds-badge-info">{{ language.t('member.public.myMatch') }}</span>
                }
                @if (!isOrganizer(match) && match.nbJoueursActuels >= 4) {
                  <span class="ml-2 ds-badge ds-badge-danger">{{ language.t('member.public.completion') }}</span>
                } @else if (!isOrganizer(match) && !canJoin(match)) {
                  <span class="ml-2 ds-badge ds-badge-warning">{{ language.t('member.public.none') }}</span>
                } @else if (!isOrganizer(match)) {
                  <span class="ml-2 ds-badge ds-badge-success">{{ language.t('member.public.available') }}</span>
                }
              </mat-card-title>
              <mat-card-subtitle>
                {{ match.date }} · {{ match.heureDebut }} - {{ match.heureFin }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="ds-data-list">
              <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.public.organizer') }}</span><span class="ds-data-value">{{ match.organisateurNom }}</span></div>
              <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.public.status') }}</span><span class="ds-data-value"><span class="ds-badge" [class]="statusBadgeClass(match.statut)">{{ matchStatusLabel(match.statut) }}</span></span></div>
              <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.public.type') }}</span><span class="ds-data-value"><span class="ds-badge" [class]="typeBadgeClass(match.typeMatch)">{{ typeLabel(match.typeMatch) }}</span></span></div>
              <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.public.players') }}</span><span class="ds-data-value">{{ match.nbJoueursActuels }}/4</span></div>
              <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.public.price') }}</span><span class="ds-data-value">{{ match.prixParJoueur }} EUR</span></div>
            </mat-card-content>
            <mat-card-actions>
              <button
                mat-flat-button
                color="primary"
                type="button"
                (click)="joinMatch(match)"
                [disabled]="joiningMatchId() === match.id || !canJoin(match)"
              >
                {{ joiningMatchId() === match.id ? language.t('member.public.registering') : language.t('member.public.join') }}
              </button>

              @if (isOrganizer(match)) {
                <button mat-stroked-button type="button" (click)="startEdit(match)" [disabled]="!canModify(match) || actionMatchId() === match.id">
                  {{ language.t('member.public.modify') }}
                </button>
                <button mat-stroked-button color="warn" type="button" (click)="cancelOwnMatch(match)" [disabled]="actionMatchId() === match.id">
                  {{ language.t('member.public.delete') }}
                </button>
              }
            </mat-card-actions>

            @if (isOrganizer(match) && !canModify(match)) {
              <p class="px-4 pb-3 text-xs text-amber-700">{{ language.t('member.public.editHint') }}</p>
            }

            @if (editingMatchId() === match.id) {
              <mat-card-content class="grid gap-3 border-t border-slate-100 pt-3 md:grid-cols-4">
                <mat-form-field appearance="outline">
                  <mat-label>{{ language.t('member.public.date') }}</mat-label>
                  <input matInput type="date" [formControl]="editForm.controls.date" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ language.t('member.public.time') }}</mat-label>
                  <input matInput type="time" [formControl]="editForm.controls.heureDebut" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ language.t('member.public.typeLabel') }}</mat-label>
                  <mat-select [formControl]="editForm.controls.typeMatch">
                    <mat-option value="PUBLIC">{{ language.t('member.create.public') }}</mat-option>
                    <mat-option value="PRIVE">{{ language.t('member.create.private') }}</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="flex items-end gap-2">
                  <button mat-flat-button color="primary" type="button" (click)="saveEdit(match)" [disabled]="editForm.invalid || actionMatchId() === match.id">
                    {{ language.t('common.save') }}
                  </button>
                  <button mat-stroked-button type="button" (click)="cancelEdit()" [disabled]="actionMatchId() === match.id">
                    {{ language.t('common.back') }}
                  </button>
                </div>
              </mat-card-content>
            }
          </mat-card>
        } @empty {
          @if (!loading()) {
            <mat-card>
              <mat-card-content class="py-6 text-slate-600">
                {{ language.t('member.public.noMatches') }}
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
  readonly language = inject(LanguageService);

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
        this.errorMessage.set(extractApiErrorMessage(error, this.language.t('member.public.loadError')));
      }
    });
  }

  joinMatch(match: MatchResponse): void {
    const memberId = this.memberSession.memberId();
    if (!memberId) {
      this.errorMessage.set(this.language.t('member.public.noMember'));
      return;
    }

    if (!this.canJoin(match)) {
      this.errorMessage.set(this.language.t('member.public.joinBlocked'));
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
          this.message.set(this.language.t('member.public.joinSuccess'));
        },
        error: (error) => {
          this.joiningMatchId.set(null);
          this.errorMessage.set(extractApiErrorMessage(error, this.language.t('member.public.joinError')));
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

  typeLabel(type: MatchResponse['typeMatch']): string {
    return type === 'PRIVE' ? this.language.t('member.create.private') : this.language.t('member.create.public');
  }

  matchStatusLabel(statut: MatchResponse['statut']): string {
    if (statut === 'PLANIFIE') {
      return this.language.t('common.matchPlanned');
    }
    if (statut === 'COMPLET') {
      return this.language.t('common.matchFull');
    }
    return this.language.t('common.matchCanceled');
  }

  startEdit(match: MatchResponse): void {
    if (!this.canModify(match)) {
      this.errorMessage.set(this.language.t('member.public.modifyTooLate'));
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
          this.message.set(this.language.t('member.public.updateSuccess'));
          this.loadData();
        },
        error: (error) => {
          this.actionMatchId.set(null);
          this.errorMessage.set(extractApiErrorMessage(error, this.language.t('member.public.updateError')));
        }
      });
  }

  cancelOwnMatch(match: MatchResponse): void {
    const memberId = this.memberSession.memberId();
    if (!memberId) {
      return;
    }

    if (!confirm(this.language.t('member.public.deleteConfirm', { id: match.id }))) {
      return;
    }

    this.actionMatchId.set(match.id);
    this.message.set('');
    this.errorMessage.set('');

    this.matchesApi.cancel(match.id, memberId).subscribe({
      next: () => {
        this.actionMatchId.set(null);
        this.editingMatchId.set(null);
        this.message.set(this.language.t('member.public.deleteSuccess'));
        this.loadData();
      },
      error: (error) => {
        this.actionMatchId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, this.language.t('member.public.deleteError')));
      }
    });
  }

  private startsInMoreThan24Hours(match: MatchResponse): boolean {
    const startDateTime = new Date(`${match.date}T${match.heureDebut}`);
    return startDateTime.getTime() - Date.now() >= 24 * 60 * 60 * 1000;
  }
}
