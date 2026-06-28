import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <div class="login-shell">
      <!-- Hero côté gauche -->
      <div class="login-hero">
        <div class="login-hero-content">
          <div class="login-hero-icon">🏆</div>
          <h1 class="login-hero-title">PadelPlay Admin</h1>
          <p class="login-hero-sub">Espace réservé aux administrateurs<br>de sites et superviseurs globaux</p>
          <div class="login-hero-badges">
            <span class="login-badge login-badge-global">🌐 Admin Global</span>
            <span class="login-badge login-badge-site">🏟️ Admin Site</span>
          </div>
        </div>
      </div>

      <!-- Formulaire côté droit -->
      <div class="login-form-panel">
        <div class="login-form-card">
          <div class="login-form-header">
            <span class="login-form-icon">🔐</span>
            <h2 class="login-form-title">Connexion</h2>
            <p class="login-form-sub">Accès réservé aux administrateurs</p>
          </div>

          <form [formGroup]="form" class="login-form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>📧 Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>🔑 Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>

            @if (errorMessage()) {
              <div class="login-error">❌ {{ errorMessage() }}</div>
            }

            <div class="login-actions">
              <button class="login-btn-primary" type="submit" [disabled]="loading() || form.invalid">
                @if (loading()) {
                  <mat-spinner diameter="20" style="display:inline-block;margin-right:8px;"></mat-spinner>
                }
                Se connecter
              </button>
              <a routerLink="/" class="login-btn-secondary">← Retour</a>
            </div>
          </form>
        </div>
      </div>
    </div>

    <style>
      .login-shell {
        display: flex; min-height: calc(100vh - 64px);
      }
      .login-hero {
        flex: 1; display: none;
        background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%);
        align-items: center; justify-content: center; padding: 3rem 2rem;
        position: relative; overflow: hidden;
      }
      @media (min-width: 768px) { .login-hero { display: flex; } }
      .login-hero::before {
        content: ''; position: absolute; inset: 0;
        background: repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 60px);
      }
      .login-hero-content { position: relative; z-index: 1; text-align: center; }
      .login-hero-icon { font-size: 5rem; margin-bottom: 1rem; }
      .login-hero-title { font-size: 2.2rem; font-weight: 800; color: #fff; margin: 0 0 0.75rem; }
      .login-hero-sub { color: rgba(255,255,255,0.82); font-size: 1rem; line-height: 1.6; margin: 0 0 1.5rem; }
      .login-hero-badges { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }
      .login-badge {
        padding: 0.4rem 1rem; border-radius: 9999px; font-weight: 700; font-size: 0.8rem;
        border: 2px solid rgba(255,255,255,0.4);
      }
      .login-badge-global { background: rgba(255,255,255,0.15); color: #fff; }
      .login-badge-site   { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }

      .login-form-panel {
        flex: 1; display: flex; align-items: center; justify-content: center;
        padding: 2rem 1rem; background: #f8fafc;
      }
      .login-form-card {
        width: 100%; max-width: 400px;
        background: #fff; border-radius: 1.5rem;
        box-shadow: 0 20px 60px rgba(3,105,161,0.12), 0 4px 16px rgba(0,0,0,0.06);
        padding: 2.5rem 2rem; border-top: 5px solid #0369a1;
      }
      .login-form-header { text-align: center; margin-bottom: 1.5rem; }
      .login-form-icon { font-size: 2.5rem; }
      .login-form-title { font-size: 1.5rem; font-weight: 800; color: #0c4a6e; margin: 0.5rem 0 0.25rem; }
      .login-form-sub { color: #64748b; font-size: 0.88rem; margin: 0; }

      .login-form { display: flex; flex-direction: column; gap: 0.75rem; }
      .login-error {
        background: #fef2f2; border: 1px solid #fca5a5; border-radius: 0.75rem;
        padding: 0.75rem 1rem; color: #991b1b; font-size: 0.875rem;
      }
      .login-actions { display: flex; gap: 0.75rem; align-items: center; padding-top: 0.5rem; }
      .login-btn-primary {
        flex: 1; background: linear-gradient(135deg, #0369a1, #0284c7); color: #fff;
        border: none; border-radius: 0.75rem; padding: 0.8rem 1.5rem;
        font-weight: 700; font-size: 1rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        box-shadow: 0 4px 14px rgba(3,105,161,0.3); transition: transform 0.15s;
      }
      .login-btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
      .login-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .login-btn-secondary {
        padding: 0.8rem 1.25rem; border-radius: 0.75rem; border: 1.5px solid #e2e8f0;
        color: #475569; font-weight: 600; font-size: 0.9rem; text-decoration: none;
        background: #f8fafc; transition: background 0.15s; white-space: nowrap;
      }
      .login-btn-secondary:hover { background: #f1f5f9; }
    </style>
  `
})
export class AdminLoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.loginAdmin(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/admin');
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set("Échec de connexion. Vérifiez l'e-mail et le mot de passe.");
      }
    });
  }
}
