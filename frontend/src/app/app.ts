import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { AdminSessionService } from './core/auth/admin-session.service';
import { MemberSessionService } from './core/auth/member-session.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <header class="app-header">
      <div class="app-header-inner">
        <!-- Logo -->
        <a routerLink="/" class="app-logo">
          <span class="app-logo-badge">🎾</span>
          <span class="app-logo-text">PadelPlay</span>
        </a>

        <!-- Nav principale -->
        <nav class="app-nav">
          <a routerLink="/" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Accueil</a>

          @if (!adminSession.isAuthenticated()) {
            <a routerLink="/admin/login" class="nav-link">Admin</a>
          }

          @if (!memberSession.isAuthenticated()) {
            <a routerLink="/member" class="nav-btn-outline">Espace membre</a>
          }

          @if (memberSession.isAuthenticated()) {
            <div class="nav-divider"></div>
            <a routerLink="/member/profile" routerLinkActive="nav-active" class="nav-link">Profil</a>
            <a routerLink="/member/matches" routerLinkActive="nav-active" class="nav-link">Matchs</a>
            <a routerLink="/member/reservations" routerLinkActive="nav-active" class="nav-link">Réservations</a>
            <a routerLink="/member/payments" routerLinkActive="nav-active" class="nav-link">Paiements</a>
            <div class="nav-divider"></div>
            <a routerLink="/member/matches/new" class="nav-btn-create">➕ Créer un match</a>
            <a routerLink="/member/matches/new" [queryParams]="{type:'PUBLIC'}" class="nav-btn-green">🎾 Match PUBLIC</a>
            <a routerLink="/member/matches/new" [queryParams]="{type:'PRIVE'}" class="nav-btn-purple">🔒 Match PRIVÉ</a>
            <div class="nav-divider"></div>
            <button class="nav-btn-logout" type="button" (click)="logoutMember()">Déconnexion</button>
          }

          @if (adminSession.isAuthenticated()) {
            <div class="nav-divider"></div>
            <a routerLink="/admin" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Dashboard</a>
            <a routerLink="/admin/members" routerLinkActive="nav-active" class="nav-link">Membres</a>
            <a routerLink="/admin/matches" routerLinkActive="nav-active" class="nav-link">Matchs</a>
            <a routerLink="/admin/sites" routerLinkActive="nav-active" class="nav-link">Sites</a>
            <a routerLink="/admin/terrains" routerLinkActive="nav-active" class="nav-link">Terrains</a>
            <a routerLink="/admin/fermetures" routerLinkActive="nav-active" class="nav-link">Fermetures</a>
            <div class="nav-divider"></div>
            <button class="nav-btn-logout" type="button" (click)="logoutAdmin()">Déconnexion</button>
          }
        </nav>
      </div>
    </header>

    <main class="app-main-shell">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 30;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0369a1 100%);
      box-shadow: 0 2px 16px rgba(3,105,161,0.25);
    }

    .app-header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.6rem 1.5rem;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .app-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }
    .app-logo-badge {
      font-size: 1.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: rgba(255,255,255,0.15);
      border-radius: 8px;
    }
    .app-logo-text {
      font-size: 1.1rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.02em;
    }

    .app-nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.4rem;
      flex: 1;
    }

    .nav-link {
      color: rgba(255,255,255,0.85);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .nav-link:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .nav-active { background: rgba(255,255,255,0.2) !important; color: #fff !important; font-weight: 700; }

    .nav-divider {
      width: 1px;
      height: 1.5rem;
      background: rgba(255,255,255,0.25);
      margin: 0 0.25rem;
      flex-shrink: 0;
    }

    .nav-btn-outline {
      color: #fff;
      border: 1.5px solid rgba(255,255,255,0.5);
      border-radius: 9999px;
      padding: 0.35rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .nav-btn-outline:hover { background: rgba(255,255,255,0.15); }

    .nav-btn-green {
      background: linear-gradient(135deg, #15803d, #16a34a);
      color: #fff;
      border: none;
      border-radius: 9999px;
      padding: 0.4rem 1rem;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(21,128,61,0.35);
      transition: transform 0.15s;
    }
    .nav-btn-green:hover { transform: translateY(-1px); }

    .nav-btn-create {
      background: linear-gradient(135deg, #ea580c, #f97316);
      color: #fff;
      border: none;
      border-radius: 9999px;
      padding: 0.4rem 1rem;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(234,88,12,0.35);
      transition: transform 0.15s;
    }
    .nav-btn-create:hover { transform: translateY(-1px); }

    .nav-btn-purple {
      background: linear-gradient(135deg, #6d28d9, #7c3aed);
      color: #fff;
      border: none;
      border-radius: 9999px;
      padding: 0.4rem 1rem;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(109,40,217,0.35);
      transition: transform 0.15s;
    }
    .nav-btn-purple:hover { transform: translateY(-1px); }

    .nav-btn-logout {
      background: rgba(239,68,68,0.15);
      color: #fca5a5;
      border: 1.5px solid rgba(239,68,68,0.35);
      border-radius: 9999px;
      padding: 0.35rem 1rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .nav-btn-logout:hover { background: rgba(239,68,68,0.25); }

    .app-main-shell {
      min-height: calc(100vh - 58px);
      background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%);
    }
  `]
})
export class App {
  readonly adminSession = inject(AdminSessionService);
  readonly memberSession = inject(MemberSessionService);
  private readonly router = inject(Router);

  logoutAdmin(): void {
    this.adminSession.clearSession();
    this.router.navigateByUrl('/admin/login');
  }

  logoutMember(): void {
    this.memberSession.clearMember();
    this.router.navigateByUrl('/member');
  }
}
