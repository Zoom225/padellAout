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
    <section class="home-shell">
      <div class="home-hero">
        <div class="home-hero-copy">
          <p class="eyebrow">Gestion de club de padel</p>
          <h1>PadelPlay</h1>
          <p class="lead">
            Une interface claire pour reserver, rejoindre un match, suivre les paiements
            et piloter les sites depuis un tableau de bord admin.
          </p>

          <div class="hero-actions">
            <a mat-flat-button color="primary" routerLink="/member">
              {{ memberSession.isAuthenticated() ? 'Ouvrir mon espace' : 'Entrer avec un matricule' }}
            </a>
            <a mat-stroked-button routerLink="/admin/login">Connexion admin</a>
            <button mat-stroked-button type="button" (click)="checkApi()" [disabled]="loading()">
              Tester l'API
            </button>
          </div>
        </div>

        <div class="court-panel" aria-label="Apercu des matchs">
          <div class="court-lines">
            <span></span>
            <span></span>
          </div>
          <div class="match-card live">
            <p>Match public</p>
            <strong>{{ count() ?? '--' }}</strong>
            <span>match(s) disponible(s)</span>
          </div>
          <div class="match-card">
            <p>Reservation</p>
            <strong>Simple</strong>
            <span>membre, terrain, paiement</span>
          </div>
        </div>
      </div>

      @if (loading() || message() || error()) {
        <mat-card class="card-soft feedback-card">
          <mat-card-content>
            @if (loading()) {
              <div class="loading-line">
                <mat-spinner diameter="28"></mat-spinner>
                <span>Verification de /api/matches/public...</span>
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
      }

      <div class="feature-grid">
        <mat-card class="feature-card">
          <mat-card-content>
            <span class="feature-code">01</span>
            <h2>Reservations</h2>
            <p>Choix du terrain, controle des disponibilites et suivi du statut.</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="feature-card">
          <mat-card-content>
            <span class="feature-code">02</span>
            <h2>Matchs publics et prives</h2>
            <p>Creation rapide avec des regles claires pour les participants.</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="feature-card">
          <mat-card-content>
            <span class="feature-code">03</span>
            <h2>Paiements</h2>
            <p>Vue propre des paiements, penalites et confirmations.</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="feature-card">
          <mat-card-content>
            <span class="feature-code">04</span>
            <h2>Administration</h2>
            <p>Indicateurs, membres, sites, terrains et fermetures au meme endroit.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .home-shell {
      width: min(1180px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 3rem 0 4rem;
    }

    .home-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
      gap: 2rem;
      align-items: stretch;
      min-height: 460px;
    }

    .home-hero-copy {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: clamp(2rem, 4vw, 4rem);
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.88)),
        radial-gradient(circle at 8% 0%, rgba(16, 185, 129, 0.18), transparent 36%);
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
    }

    .eyebrow {
      margin: 0 0 0.8rem;
      color: #047857;
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: #0f172a;
      font-size: clamp(3rem, 8vw, 6rem);
      line-height: 0.95;
      font-weight: 900;
      letter-spacing: 0;
    }

    .lead {
      max-width: 640px;
      margin: 1.3rem 0 0;
      color: #475569;
      font-size: 1.08rem;
      line-height: 1.75;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      margin-top: 2rem;
    }

    .court-panel {
      position: relative;
      overflow: hidden;
      min-height: 420px;
      border-radius: 8px;
      border: 1px solid rgba(4, 120, 87, 0.18);
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 0.54) 1px, transparent 1px),
        linear-gradient(180deg, rgba(255, 255, 255, 0.54) 1px, transparent 1px),
        linear-gradient(135deg, #0f766e, #22c55e 55%, #84cc16);
      background-size: 52px 52px, 52px 52px, auto;
      box-shadow: 0 24px 60px rgba(4, 120, 87, 0.16);
    }

    .court-lines {
      position: absolute;
      inset: 42px;
      border: 2px solid rgba(255, 255, 255, 0.72);
    }

    .court-lines::before,
    .court-lines::after {
      content: '';
      position: absolute;
      background: rgba(255, 255, 255, 0.72);
    }

    .court-lines::before {
      inset: 0 auto 0 50%;
      width: 2px;
    }

    .court-lines::after {
      inset: 50% 0 auto;
      height: 2px;
    }

    .court-lines span {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgba(255, 255, 255, 0.52);
    }

    .court-lines span:first-child {
      left: 25%;
    }

    .court-lines span:last-child {
      right: 25%;
    }

    .match-card {
      position: absolute;
      right: 1.2rem;
      bottom: 1.2rem;
      width: min(240px, calc(100% - 2.4rem));
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
      backdrop-filter: blur(12px);
    }

    .match-card.live {
      top: 1.2rem;
      bottom: auto;
      left: 1.2rem;
      right: auto;
    }

    .match-card p {
      margin: 0 0 0.35rem;
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .match-card strong {
      display: block;
      color: #0f172a;
      font-size: 2rem;
      line-height: 1;
    }

    .match-card span {
      display: block;
      margin-top: 0.35rem;
      color: #475569;
      font-size: 0.9rem;
    }

    .feedback-card {
      margin-top: 1.5rem;
    }

    .loading-line {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      color: #475569;
      font-weight: 700;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .feature-card {
      min-height: 190px;
      border-radius: 8px !important;
    }

    .feature-card h2 {
      margin: 1rem 0 0.5rem;
      color: #0f172a;
      font-size: 1.05rem;
      font-weight: 850;
    }

    .feature-card p {
      margin: 0;
      color: #64748b;
      line-height: 1.6;
    }

    .feature-code {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.3rem;
      height: 2.3rem;
      border-radius: 8px;
      background: #ecfdf5;
      color: #047857;
      font-weight: 900;
    }

    @media (max-width: 920px) {
      .home-hero,
      .feature-grid {
        grid-template-columns: 1fr;
      }

      .court-panel {
        min-height: 360px;
      }
    }
  `]
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

    return `Proxy OK - ${this.count()} match(s) public(s) recupere(s)`;
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
        this.error.set("Echec de l'appel API. Verifiez que le backend tourne sur le port 8080.");
        this.loading.set(false);
      }
    });
  }
}
