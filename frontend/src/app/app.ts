import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { AdminSessionService } from './core/auth/admin-session.service';
import { MemberSessionService } from './core/auth/member-session.service';
import { LanguageService } from './core/i18n/language.service';
import { LanguageSwitcherComponent } from './shared/components/language-switcher.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, LanguageSwitcherComponent],
  template: `
<header class="app-header">
  <div class="app-header-inner">
    <a routerLink="/" class="app-logo">
      <span class="app-logo-badge">P</span>
      <span class="app-logo-text">PadelPlay</span>
    </a>

    <nav class="app-nav">
      <a routerLink="/" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">
        {{ navText().home }}
      </a>

      @if (!adminSession.isAuthenticated()) {
        <a routerLink="/admin/login" class="nav-link">{{ navText().admin }}</a>
      }

      @if (!memberSession.isAuthenticated()) {
        <a routerLink="/member" class="nav-btn-outline">{{ navText().member }}</a>
      }

      @if (memberSession.isAuthenticated()) {
        <div class="nav-divider"></div>
        <a routerLink="/member/profile" routerLinkActive="nav-active" class="nav-link">{{ navText().profile }}</a>
        <a routerLink="/member/matches" routerLinkActive="nav-active" class="nav-link">{{ navText().matches }}</a>
        <a routerLink="/member/reservations" routerLinkActive="nav-active" class="nav-link">{{ navText().reservations }}</a>
        <a routerLink="/member/payments" routerLinkActive="nav-active" class="nav-link">{{ navText().payments }}</a>
        <div class="nav-divider"></div>
        <a routerLink="/member/matches/new" class="nav-btn-create">{{ navText().create }}</a>
        <a routerLink="/member/matches/new" [queryParams]="{type:'PUBLIC'}" class="nav-btn-green">{{ navText().public }}</a>
        <a routerLink="/member/matches/new" [queryParams]="{type:'PRIVE'}" class="nav-btn-purple">{{ navText().private }}</a>
        <div class="nav-divider"></div>
        <button class="nav-btn-logout" type="button" (click)="logoutMember()">{{ navText().logout }}</button>
      }

      @if (adminSession.isAuthenticated()) {
        <div class="nav-divider"></div>
        <a routerLink="/admin" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">{{ navText().dashboard }}</a>
        <a routerLink="/admin/members" routerLinkActive="nav-active" class="nav-link">{{ navText().members }}</a>
        <a routerLink="/admin/matches" routerLinkActive="nav-active" class="nav-link">{{ navText().matches }}</a>
        <a routerLink="/admin/sites" routerLinkActive="nav-active" class="nav-link">{{ navText().sites }}</a>
        <a routerLink="/admin/terrains" routerLinkActive="nav-active" class="nav-link">{{ navText().courts }}</a>
        <a routerLink="/admin/fermetures" routerLinkActive="nav-active" class="nav-link">{{ navText().closures }}</a>
        <div class="nav-divider"></div>
        <button class="nav-btn-logout" type="button" (click)="logoutAdmin()">{{ navText().logout }}</button>
      }
    </nav>

    <app-language-switcher class="app-lang-switcher"></app-language-switcher>
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
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      backdrop-filter: blur(18px);
    }

    .app-header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
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
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .app-logo-badge {
      color: #ffffff;
      font-size: 1rem;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, #0f766e, #16a34a);
      border-radius: 8px;
      box-shadow: 0 10px 22px rgba(15, 118, 110, 0.24);
    }

    .app-logo-text {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0;
    }

    .app-nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.4rem;
      flex: 1;
    }

    .app-lang-switcher {
      flex-shrink: 0;
      margin-left: auto;
    }

    .nav-link {
      color: #475569;
      font-size: 0.875rem;
      font-weight: 650;
      text-decoration: none;
      padding: 0.48rem 0.82rem;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s, transform 0.15s;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: #f1f5f9;
      color: #0f172a;
      transform: translateY(-1px);
    }

    .nav-active {
      background: #ecfdf5 !important;
      color: #047857 !important;
      font-weight: 800;
    }

    .nav-divider {
      width: 1px;
      height: 1.5rem;
      background: rgba(15, 23, 42, 0.12);
      margin: 0 0.25rem;
      flex-shrink: 0;
    }

    .nav-btn-outline,
    .nav-btn-green,
    .nav-btn-create,
    .nav-btn-purple,
    .nav-btn-logout {
      border-radius: 8px;
      padding: 0.45rem 0.95rem;
      font-size: 0.83rem;
      font-weight: 800;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
    }

    .nav-btn-outline {
      color: #0f766e;
      border: 1px solid rgba(15, 118, 110, 0.26);
      background: #ffffff;
    }

    .nav-btn-outline:hover {
      background: #ecfdf5;
      transform: translateY(-1px);
    }

    .nav-btn-green {
      background: #047857;
      color: #ffffff;
      border: none;
      box-shadow: 0 8px 18px rgba(4, 120, 87, 0.22);
    }

    .nav-btn-create {
      background: #0f172a;
      color: #ffffff;
      border: none;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
    }

    .nav-btn-purple {
      background: #2563eb;
      color: #ffffff;
      border: none;
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
    }

    .nav-btn-green:hover,
    .nav-btn-create:hover,
    .nav-btn-purple:hover {
      transform: translateY(-1px);
    }

    .nav-btn-logout {
      background: #fff1f2;
      color: #be123c;
      border: 1px solid rgba(225, 29, 72, 0.2);
      cursor: pointer;
    }

    .nav-btn-logout:hover {
      background: #ffe4e6;
    }

    .app-main-shell {
      min-height: calc(100vh - 58px);
      background: transparent;
    }

    @media (max-width: 760px) {
      .app-header-inner {
        padding: 0.7rem 1rem;
      }

      .app-nav {
        width: 100%;
      }

      .app-lang-switcher {
        width: 100%;
        margin-left: 0;
      }

      .nav-divider {
        display: none;
      }
    }
  `]
})
export class App {
  readonly adminSession = inject(AdminSessionService);
  readonly memberSession = inject(MemberSessionService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);
  readonly navText = computed(() => ({
    home: this.language.t('nav.home'),
    admin: this.language.t('nav.admin'),
    member: this.language.t('nav.member'),
    profile: this.language.t('nav.profile'),
    matches: this.language.t('nav.matches'),
    dashboard: this.language.t('nav.dashboard'),
    members: this.language.t('nav.members'),
    sites: this.language.t('nav.sites'),
    courts: this.language.t('nav.courts'),
    closures: this.language.t('nav.closures'),
    reservations: this.language.t('nav.reservations'),
    payments: this.language.t('nav.payments'),
    create: this.language.t('nav.create'),
    public: this.language.t('nav.public'),
    private: this.language.t('nav.private'),
    logout: this.language.t('nav.logout')
  }));

  logoutAdmin(): void {
    this.adminSession.clearSession();
    this.router.navigateByUrl('/admin/login');
  }

  logoutMember(): void {
    this.memberSession.clearMember();
    this.router.navigateByUrl('/member');
  }
}
