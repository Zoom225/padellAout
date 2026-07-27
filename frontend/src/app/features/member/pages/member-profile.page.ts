import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { MembreResponse } from '../../../shared/models/membre.model';

@Component({
  selector: 'app-member-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <section class="page-shell max-w-6xl">
      <mat-card class="card-soft">
        <mat-card-header>
          <mat-card-title class="title-gradient ds-section-title">{{ language.t('member.profile.title') }}</mat-card-title>
          <mat-card-subtitle class="ds-subtitle">{{ language.t('member.profile.subtitle') }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="py-4">
              <mat-spinner diameter="28"></mat-spinner>
            </div>
          } @else if (profile()) {
            <div class="grid gap-4 md:grid-cols-2">
              <div class="ds-data-list">
                <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.profile.nom') }}</span><span class="ds-data-value">{{ profile()!.nom }}</span></div>
                <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.profile.prenom') }}</span><span class="ds-data-value">{{ profile()!.prenom }}</span></div>
                <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.profile.email') }}</span><span class="ds-data-value">{{ profile()!.email || language.t('common.notProvided') }}</span></div>
                <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.profile.matricule') }}</span><span class="ds-data-value">{{ profile()!.matricule }}</span></div>
              </div>

              <div class="ds-data-list">
                <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.profile.type') }}</span><span class="ds-data-value"><span class="ds-badge" [class]="memberTypeBadgeClass(profile()!.typeMembre)">{{ profile()!.typeMembre }}</span></span></div>
                <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.profile.site') }}</span><span class="ds-data-value">{{ profile()!.siteNom || language.t('member.home.tousSites') }}</span></div>
                <div class="ds-data-row"><span class="ds-data-key">{{ language.t('member.profile.solde') }}</span><span class="ds-data-value">{{ profile()!.solde }} EUR</span></div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <mat-chip-set>
                <mat-chip [highlighted]="true" [color]="hasPenalty() ? 'warn' : 'primary'">
                  {{ language.t('member.profile.penaltyActive') }}: {{ hasPenalty() ? language.t('member.profile.yes') : language.t('member.profile.no') }}
                </mat-chip>
                <mat-chip [highlighted]="true" [color]="hasBalance() ? 'warn' : 'primary'">
                  {{ language.t('member.profile.balancePending') }}: {{ hasBalance() ? language.t('member.profile.yes') : language.t('member.profile.no') }}
                </mat-chip>
              </mat-chip-set>
            </div>
          }

          @if (errorMessage()) {
            <p class="status-error mt-4">{{ errorMessage() }}</p>
          }

          <div class="mt-6">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-xl">🎾</span>
              <h3 class="m-0 text-lg font-bold text-slate-800">{{ language.t('member.profile.createQuick') }}</h3>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <a [routerLink]="['/member/matches/new']" [queryParams]="{type:'PUBLIC'}"
                 class="card-soft block rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
                <div class="mb-2 flex items-center gap-3">
                  <span class="text-3xl">🌍</span>
                  <div>
                    <div class="text-xs font-bold uppercase tracking-wide text-emerald-700">{{ language.t('member.profile.publicMatch') }}</div>
                    <div class="text-lg font-extrabold text-emerald-900">{{ language.t('member.profile.quickPublic') }}</div>
                  </div>
                </div>
                <p class="m-0 text-sm text-emerald-800">{{ language.t('member.profile.quickPublicBody') }}</p>
              </a>

              <a [routerLink]="['/member/matches/new']" [queryParams]="{type:'PRIVE'}"
                 class="card-soft block rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
                <div class="mb-2 flex items-center gap-3">
                  <span class="text-3xl">🔒</span>
                  <div>
                    <div class="text-xs font-bold uppercase tracking-wide text-violet-700">{{ language.t('member.profile.privateMatch') }}</div>
                    <div class="text-lg font-extrabold text-violet-900">{{ language.t('member.profile.quickPrivate') }}</div>
                  </div>
                </div>
                <p class="m-0 text-sm text-violet-800">{{ language.t('member.profile.quickPrivateBody') }}</p>
              </a>
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <a routerLink="/member/matches" class="card-soft block rounded-2xl p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
              <p class="text-sm font-medium uppercase tracking-wide text-indigo-700">🔍 {{ language.t('member.profile.explore') }}</p>
              <p class="mt-2 text-xl font-semibold text-slate-900">{{ language.t('member.public.title') }}</p>
              <p class="mt-2 text-sm text-slate-600">{{ language.t('member.profile.exploreBody') }}</p>
            </a>
            <a routerLink="/member/reservations" class="card-soft block rounded-2xl p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
              <p class="text-sm font-medium uppercase tracking-wide text-emerald-700">📋 {{ language.t('member.profile.followup') }}</p>
              <p class="mt-2 text-xl font-semibold text-slate-900">{{ language.t('member.reservations.title') }}</p>
              <p class="mt-2 text-sm text-slate-600">{{ language.t('member.profile.followupBody') }}</p>
            </a>
            <a routerLink="/member/payments" class="card-soft block rounded-2xl p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
              <p class="text-sm font-medium uppercase tracking-wide text-orange-700">💳 {{ language.t('member.profile.finance') }}</p>
              <p class="mt-2 text-xl font-semibold text-slate-900">{{ language.t('member.payments.title') }}</p>
              <p class="mt-2 text-sm text-slate-600">{{ language.t('member.profile.financeBody') }}</p>
            </a>
          </div>

          <div class="toolbar-actions mt-6 justify-start">
            <button mat-flat-button color="primary" type="button" (click)="reload()">{{ language.t('member.profile.refresh') }}</button>
            <a mat-stroked-button routerLink="/member/matches">{{ language.t('member.public.title') }}</a>
            <a mat-stroked-button routerLink="/member/reservations">{{ language.t('member.reservations.title') }}</a>
            <a mat-stroked-button routerLink="/member">{{ language.t('common.profile') }}</a>
            <button mat-stroked-button type="button" (click)="logout()">{{ language.t('member.profile.logout') }}</button>
          </div>
        </mat-card-content>
      </mat-card>
    </section>
  `
})
export class MemberProfilePage {
  private readonly membresApi = inject(MembresApiService);
  private readonly memberSession = inject(MemberSessionService);
  private readonly router = inject(Router);
  readonly language = inject(LanguageService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly profile = signal<MembreResponse | null>(null);
  readonly hasPenalty = signal(false);
  readonly hasBalance = signal(false);
  readonly memberId = computed(() => this.memberSession.memberId());

  constructor() {
    this.reload();
  }

  reload(): void {
    const memberId = this.memberId();
    if (!memberId) {
      this.logout();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      profile: this.membresApi.getCurrent(),
      hasPenalty: this.membresApi.hasPenalty(memberId),
      hasBalance: this.membresApi.hasBalance(memberId)
    }).subscribe({
      next: ({ profile, hasPenalty, hasBalance }) => {
        this.profile.set(profile);
        this.memberSession.setMember(profile, this.memberSession.token() ?? undefined);
        this.hasPenalty.set(hasPenalty);
        this.hasBalance.set(hasBalance);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set(this.language.t('member.profile.loadError'));
      }
    });
  }

  logout(): void {
    this.memberSession.clearMember();
    this.router.navigateByUrl('/member');
  }

  memberTypeBadgeClass(type: MembreResponse['typeMembre']): string {
    if (type === 'GLOBAL') {
      return 'ds-badge-info';
    }
    if (type === 'SITE') {
      return 'ds-badge-success';
    }
    return 'ds-badge-warning';
  }
}
