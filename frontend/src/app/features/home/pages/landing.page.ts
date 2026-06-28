import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page-shell max-w-5xl">
      <mat-card class="card-soft overflow-hidden">
        <div class="h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"></div>
        <mat-card-header>
          <mat-card-title>PadelPlay Frontend</mat-card-title>
          <mat-card-subtitle>Angular + Tailwind + Material</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="mb-4 text-slate-700 md:text-base">
            Le frontend communique avec le backend via le proxy et propose déjà l'accès membre par matricule
            ainsi que la connexion administrateur.
          </p>

          <div class="flex flex-wrap gap-3">
            <button mat-flat-button color="primary" (click)="checkApi()" [disabled]="loading()">
              Tester /api/matches/public
            </button>
            <a mat-stroked-button routerLink="/member">
              {{ memberSession.isAuthenticated() ? 'Mon profil membre' : 'Entrer avec un matricule' }}
            </a>
            <a mat-stroked-button routerLink="/admin/login" color="accent">Connexion admin</a>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="grid gap-4 md:grid-cols-3">
        <mat-card class="kpi-card">
          <p class="text-sm text-slate-500">Navigation rapide</p>
          <p class="text-lg font-semibold text-slate-800">Espace membre et admin</p>
        </mat-card>
        <mat-card class="kpi-card">
          <p class="text-sm text-slate-500">Règles métier</p>
          <p class="text-lg font-semibold text-slate-800">Réservations, paiements, pénalités</p>
        </mat-card>
        <mat-card class="kpi-card">
          <p class="text-sm text-slate-500">Stack</p>
          <p class="text-lg font-semibold text-slate-800">Spring Boot + Angular</p>
        </mat-card>
      </div>

      <mat-card class="card-soft">
        <mat-card-header>
          <mat-card-title>kangoute Azoumanan fullstack</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="py-3">
              <mat-spinner diameter="28"></mat-spinner>
            </div>
          }

          @if (message()) {
            <p class="status-success">{{ message() }}</p>
          }
          @if (error()) {
            <p class="status-error">{{ error() }}</p>
          }
        </mat-card-content>
      </mat-card>
    </section>
  `
})
export class LandingPage {
  private readonly matchesApi = inject(MatchesApiService);
  readonly memberSession = inject(MemberSessionService);

  readonly loading = signal(false);
  readonly count = signal<number | null>(null);
  readonly error = signal<string>('');
  readonly message = computed(() => {
    if (this.count() === null) {
      return '';
    }

    return `Proxy OK - ${this.count()} match(s) public(s) récupéré(s)`;
  });

  checkApi(): void {
    this.loading.set(true);
    this.error.set('');

    this.matchesApi.getPublic().subscribe({
      next: (matches) => {
        this.count.set(matches.length);
        this.loading.set(false);
      },
      error: () => {
        this.count.set(null);
        this.error.set("Échec de l'appel API. Vérifiez que le backend tourne sur le port 8080.");
        this.loading.set(false);
      }
    });
  }
}
