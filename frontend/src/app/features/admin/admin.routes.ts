import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
	path: 'login',
	loadComponent: () => import('./pages/admin-login.page').then((m) => m.AdminLoginPage),
	title: 'PadelPlay - Login admin'
  },
  {
	path: '',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-home.page').then((m) => m.AdminHomePage),
	title: 'PadelPlay - Dashboard admin'
  },
  {
	path: 'members',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-members.page').then((m) => m.AdminMembersPage),
	title: 'PadelPlay - Membres admin'
  },
  {
	path: 'matches',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-matches.page').then((m) => m.AdminMatchesPage),
	title: 'PadelPlay - Matchs admin'
  },
  {
	path: 'sites',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-sites.page').then((m) => m.AdminSitesPage),
	title: 'PadelPlay - Sites admin'
  },
  {
	path: 'terrains',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-terrains.page').then((m) => m.AdminTerrainsPage),
	title: 'PadelPlay - Terrains admin'
  },
  {
	path: 'fermetures',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-jours-fermeture.page').then((m) => m.AdminJoursFermeturePage),
	title: 'PadelPlay - Jours de fermeture'
  }
];

