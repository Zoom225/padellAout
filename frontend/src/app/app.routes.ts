import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/landing.page').then((m) => m.LandingPage),
    title: 'PadelPlay - Accueil'
  },
  {
    path: 'member',
    loadChildren: () => import('./features/member/member.routes').then((m) => m.MEMBER_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
