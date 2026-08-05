import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { MembreResponse } from '../../../shared/models/membre.model';

@Component({
  selector: 'app-member-home-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="padel-hero">
      <div class="padel-hero-content">
        <div class="padel-ball">🎾</div>
        <h1 class="padel-hero-title">{{ language.t('member.home.title') }}</h1>
        <p class="padel-hero-sub">{{ language.t('member.home.subtitle') }}</p>
      </div>
    </div>

    <section class="page-shell max-w-4xl">
      <div class="padel-login-card">
        <div class="padel-login-icon">🏓</div>
        <h2 class="padel-login-title">{{ language.t('member.home.identification') }}</h2>
        <p class="padel-login-sub">{{ language.t('member.home.loginHint') }}</p>

        <form [formGroup]="form" class="padel-form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ language.t('member.home.matricule') }}</mat-label>
            <input
              matInput
              formControlName="matricule"
              [placeholder]="language.t('member.home.matriculePlaceholder')"
              style="text-transform:uppercase; font-weight:600; letter-spacing:0.08em;"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ language.t('member.home.password') }}</mat-label>
            <input
              matInput
              [type]="showMemberPassword ? 'text' : 'password'"
              formControlName="password"
              autocomplete="current-password"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              class="password-toggle-button"
              [attr.aria-label]="showMemberPassword ? language.t('member.home.hidePassword') : language.t('member.home.showPassword')"
              (click)="toggleMemberPassword()"
            >
              <mat-icon>{{ showMemberPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <div class="padel-types-grid">
            <div class="padel-type-badge padel-type-global">
              <span class="padel-type-icon">🌍</span>
              <div>
                <div class="padel-type-name">{{ language.t('member.home.global') }}</div>
                <div class="padel-type-hint">{{ language.t('member.home.globalHint') }}</div>
              </div>
            </div>
            <div class="padel-type-badge padel-type-site">
              <span class="padel-type-icon">🏟️</span>
              <div>
                <div class="padel-type-name">{{ language.t('member.home.site') }}</div>
                <div class="padel-type-hint">{{ language.t('member.home.siteHint') }}</div>
              </div>
            </div>
            <div class="padel-type-badge padel-type-libre">
              <span class="padel-type-icon">⚡</span>
              <div>
                <div class="padel-type-name">{{ language.t('member.home.livre') }}</div>
                <div class="padel-type-hint">{{ language.t('member.home.livreHint') }}</div>
              </div>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="padel-error"><span>❌</span> {{ errorMessage() }}</div>
          }

          @if (foundMember()) {
            <div class="padel-found-card">
              <div class="padel-found-icon">✅</div>
              <div>
                <div class="padel-found-name">
                  {{ foundMember()!.prenom }} {{ foundMember()!.nom }}
                </div>
                <div class="padel-found-details">
                  <span
                    class="padel-badge-type"
                    [class]="'padel-badge-' + foundMember()!.typeMembre.toLowerCase()"
                  >
                    {{ foundMember()!.typeMembre }}
                  </span>
                  <span>· {{ foundMember()!.siteNom || language.t('member.home.allSites') }}</span>
                </div>
              </div>
            </div>
          }

          <div class="padel-form-actions">
            <button class="padel-btn-primary" type="submit" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner
                  diameter="20"
                  style="display:inline-block; margin-right:8px;"
                ></mat-spinner>
              }
              🎾 {{ language.t('member.home.cta') }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <style>
      .padel-hero {
        background: linear-gradient(135deg, #166534 0%, #15803d 40%, #16a34a 70%, #86efac 100%);
        padding: 3rem 1.5rem 4rem;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .padel-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            rgba(255, 255, 255, 0.04) 40px,
            rgba(255, 255, 255, 0.04) 42px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(255, 255, 255, 0.04) 40px,
            rgba(255, 255, 255, 0.04) 42px
          );
      }
      .padel-hero-content {
        position: relative;
        z-index: 1;
      }
      .padel-ball {
        font-size: 4rem;
        margin-bottom: 0.5rem;
        animation: spin 8s linear infinite;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .padel-hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #fff;
        margin: 0 0 0.5rem;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      .padel-hero-sub {
        color: rgba(255, 255, 255, 0.88);
        font-size: 1.05rem;
        margin: 0;
      }

      .padel-login-card {
        background: #fff;
        border-radius: 1.5rem;
        box-shadow:
          0 20px 60px rgba(22, 101, 52, 0.15),
          0 4px 16px rgba(0, 0, 0, 0.08);
        padding: 2.5rem 2rem;
        text-align: center;
        border-top: 5px solid #16a34a;
        margin-top: -2.5rem;
      }
      .padel-login-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }
      .padel-login-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: #14532d;
        margin: 0 0 0.3rem;
      }
      .padel-login-sub {
        color: #6b7280;
        margin: 0 0 1.5rem;
      }
      .padel-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-align: left;
      }

      .padel-types-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 0.75rem;
      }
      .padel-type-badge {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        border: 2px solid transparent;
        transition: transform 0.15s;
      }
      .padel-type-badge:hover {
        transform: translateY(-2px);
      }
      .padel-type-global {
        background: #eff6ff;
        border-color: #93c5fd;
      }
      .padel-type-site {
        background: #f0fdf4;
        border-color: #86efac;
      }
      .padel-type-libre {
        background: #fefce8;
        border-color: #fde047;
      }
      .padel-type-icon {
        font-size: 1.5rem;
      }
      .padel-type-name {
        font-weight: 700;
        font-size: 0.85rem;
        color: #1e293b;
      }
      .padel-type-hint {
        font-size: 0.72rem;
        color: #64748b;
      }

      .padel-error {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        color: #991b1b;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .padel-found-card {
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        border: 2px solid #4ade80;
        border-radius: 1rem;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .padel-found-icon {
        font-size: 2rem;
      }
      .padel-found-name {
        font-weight: 700;
        font-size: 1.1rem;
        color: #14532d;
      }
      .padel-found-details {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: #374151;
        margin-top: 0.25rem;
      }

      .padel-badge-type {
        display: inline-block;
        padding: 0.15rem 0.6rem;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.05em;
      }
      .padel-badge-global {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .padel-badge-site {
        background: #dcfce7;
        color: #15803d;
      }
      .padel-badge-libre {
        background: #fef9c3;
        color: #a16207;
      }

      .padel-form-actions {
        display: flex;
        justify-content: center;
        padding-top: 0.5rem;
      }
      .padel-btn-primary {
        background: linear-gradient(135deg, #15803d, #16a34a);
        color: #fff;
        border: none;
        border-radius: 0.75rem;
        padding: 0.85rem 2.5rem;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(21, 128, 61, 0.35);
        transition:
          transform 0.15s,
          box-shadow 0.15s;
      }
      .padel-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(21, 128, 61, 0.45);
      }
      .padel-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .password-toggle-button {
        width: 40px;
        height: 40px;
        line-height: 40px;
        color: #64748b;
      }
    </style>
  `,
})
export class MemberHomePage {
  private readonly authService = inject(AuthService);
  private readonly memberSession = inject(MemberSessionService);
  private readonly router = inject(Router);
  readonly language = inject(LanguageService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly foundMember = signal<MembreResponse | null>(null);
  showMemberPassword = false;

  readonly form = new FormGroup({
    matricule: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(G\d{4}|S\d{5}|L\d{5})$/i)]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor() {
    if (this.memberSession.isAuthenticated()) {
      this.router.navigateByUrl('/member/profile');
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.foundMember.set(null);

    const matricule = this.form.controls.matricule.getRawValue().trim().toUpperCase();
    const password = this.form.controls.password.getRawValue();

    this.authService.loginMember({ matricule, password }).subscribe({
      next: (member) => {
        this.foundMember.set(member);
        this.loading.set(false);
        setTimeout(() => this.router.navigateByUrl('/member/profile'), 600);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set(this.language.t('member.home.invalid'));
      }
    });
  }

  toggleMemberPassword(): void {
    this.showMemberPassword = !this.showMemberPassword;
  }
}
