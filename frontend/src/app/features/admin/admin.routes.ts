import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
	path: 'login',
	loadComponent: () => import('./pages/admin-login.page').then((m) => m.AdminLoginPage),
	title: () => `PadelPlay - ${inject(LanguageService).t('nav.adminLogin')}`
  },
  {
	path: '',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-home.page').then((m) => m.AdminHomePage),
	title: () => `PadelPlay - ${inject(LanguageService).t('nav.dashboard')}`
  },
  {
	path: 'members',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-members.page').then((m) => m.AdminMembersPage),
	title: () => `PadelPlay - ${inject(LanguageService).t('nav.members')}`
  },
  {
	path: 'matches',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-matches.page').then((m) => m.AdminMatchesPage),
	title: () => `PadelPlay - ${inject(LanguageService).t('nav.matches')}`
  },
  {
	path: 'sites',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-sites.page').then((m) => m.AdminSitesPage),
	title: () => `PadelPlay - ${inject(LanguageService).t('nav.sites')}`
  },
  {
	path: 'terrains',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-terrains.page').then((m) => m.AdminTerrainsPage),
	title: () => `PadelPlay - ${inject(LanguageService).t('nav.courts')}`
  },
  {
	path: 'fermetures',
	canActivate: [adminGuard],
	data: { roles: ['GLOBAL', 'SITE'] },
	loadComponent: () => import('./pages/admin-jours-fermeture.page').then((m) => m.AdminJoursFermeturePage),
	title: () => `PadelPlay - ${inject(LanguageService).t('nav.closures')}`
  }
];

