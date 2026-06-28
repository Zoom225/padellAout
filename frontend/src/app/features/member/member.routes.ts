import { Routes } from '@angular/router';
import { memberGuard } from '../../core/guards/member.guard';

export const MEMBER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/member-home.page').then((m) => m.MemberHomePage),
    title: 'PadelPlay - Espace membre'
  },
  {
    path: 'profile',
    canActivate: [memberGuard],
    loadComponent: () => import('./pages/member-profile.page').then((m) => m.MemberProfilePage),
    title: 'PadelPlay - Profil membre'
  },
  {
    path: 'matches',
    canActivate: [memberGuard],
    loadComponent: () => import('./pages/member-public-matches.page').then((m) => m.MemberPublicMatchesPage),
    title: 'PadelPlay - Matchs publics'
  },
  {
    path: 'matches/new',
    canActivate: [memberGuard],
    loadComponent: () => import('./pages/member-create-match.page').then((m) => m.MemberCreateMatchPage),
    title: 'PadelPlay - Créer un match'
  },
  {
    path: 'reservations',
    canActivate: [memberGuard],
    loadComponent: () => import('./pages/member-reservations.page').then((m) => m.MemberReservationsPage),
    title: 'PadelPlay - Réservations membre'
  },
  {
    path: 'payments',
    canActivate: [memberGuard],
    loadComponent: () => import('./pages/member-payments.page').then((m) => m.MemberPaymentsPage),
    title: 'PadelPlay - Paiements membre'
  }
];
