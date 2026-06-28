import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { JoursFermetureApiService } from '../../../core/api/jours-fermeture-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { JourFermetureResponse, SiteResponse } from '../../../shared/models/site-terrain.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-admin-jours-fermeture-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- En-tête fermetures -->
    <div class="adm-fer-header">
      <div class="adm-fer-header-inner">
        <div class="adm-fer-title-block">
          <span class="adm-fer-icon">🔒</span>
          <div>
            <h1 class="adm-fer-title">Jours de fermeture</h1>
            <p class="adm-fer-sub">Gestion des fermetures globales et par site</p>
          </div>
        </div>
        <a routerLink="/admin" class="adm-fer-back-btn">← Tableau de bord</a>
      </div>
    </div>

    <section class="page-shell">
      <!-- Formulaire -->
      <div class="adm-fer-form-card">
        <div class="adm-fer-form-header">
          <span>➕</span>
          <h2 class="adm-fer-form-title">Ajouter un jour de fermeture</h2>
        </div>
        <form [formGroup]="form" class="grid gap-4 pt-4 md:grid-cols-2" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>📅 Date</mat-label>
            <input matInput type="date" formControlName="date" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>📝 Raison (optionnel)</mat-label>
            <input matInput formControlName="raison" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>🏟️ Site concerné</mat-label>
            <mat-select formControlName="siteId" [disabled]="form.controls.global.value">
              <mat-option [value]="null">🌐 Aucun (global)</mat-option>
              @for (site of sites(); track site.id) {
                <mat-option [value]="site.id">{{ site.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="flex items-center">
            <mat-checkbox formControlName="global" (change)="onGlobalChange($event.checked)">
              🌐 Fermeture globale (tous les sites)
            </mat-checkbox>
          </div>

          @if (message()) {
            <div class="status-success md:col-span-2">✅ {{ message() }}</div>
          }
          @if (errorMessage()) {
            <div class="status-error md:col-span-2">❌ {{ errorMessage() }}</div>
          }

          <div class="flex flex-wrap items-center gap-3 md:col-span-2">
            <button class="adm-fer-btn-primary" type="submit" [disabled]="loading() || form.invalid">
              ➕ Ajouter la fermeture
            </button>
            <button class="adm-fer-btn-secondary" type="button" (click)="resetForm()">🔄 Réinitialiser</button>
            @if (loading()) {
              <mat-spinner diameter="24"></mat-spinner>
            }
          </div>
        </form>
      </div>

      <!-- Liste des jours -->
      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        @for (jour of filteredJours(); track jour.id) {
          <div class="adm-fer-card" [class.adm-fer-card-global]="jour.global">
            <div class="adm-fer-card-top">
              <div class="adm-fer-date">📅 {{ jour.date }}</div>
              <span class="adm-fer-badge" [class.adm-fer-badge-global]="jour.global" [class.adm-fer-badge-site]="!jour.global">
                {{ jour.global ? '🌐 GLOBAL' : '🏟️ SITE' }}
              </span>
            </div>
            @if (!jour.global) {
              <div class="adm-fer-site">🏟️ {{ jour.siteNom }}</div>
            }
            <div class="adm-fer-raison">
              📝 {{ jour.raison || 'Raison non précisée' }}
            </div>
            <div class="adm-fer-card-actions">
              <button class="adm-fer-action-delete" type="button" (click)="remove(jour.id)">🗑️ Supprimer</button>
            </div>
          </div>
        } @empty {
          @if (!loading()) {
            <div class="adm-fer-empty md:col-span-2 lg:col-span-3">
              <span>🔓</span>
              <p>Aucun jour de fermeture configuré</p>
            </div>
          }
        }
      </div>
    </section>

    <style>
      .adm-fer-header {
        background: linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 16px rgba(180,83,9,0.3);
      }
      .adm-fer-header-inner {
        display: flex; align-items: center; justify-content: space-between;
        max-width: 1200px; margin: 0 auto; gap: 1rem; flex-wrap: wrap;
      }
      .adm-fer-title-block { display: flex; align-items: center; gap: 1rem; }
      .adm-fer-icon { font-size: 2.5rem; }
      .adm-fer-title { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
      .adm-fer-sub { color: rgba(255,255,255,0.75); font-size: 0.85rem; margin: 0; }
      .adm-fer-back-btn {
        background: rgba(255,255,255,0.15); color: #fff; border: 2px solid rgba(255,255,255,0.35);
        border-radius: 9999px; padding: 0.45rem 1.1rem; font-weight: 700;
        font-size: 0.85rem; text-decoration: none; transition: background 0.15s; white-space: nowrap;
      }
      .adm-fer-back-btn:hover { background: rgba(255,255,255,0.25); }

      .adm-fer-form-card {
        background: #fff; border-radius: 1.25rem;
        box-shadow: 0 4px 20px rgba(180,83,9,0.1);
        padding: 1.5rem; border-left: 5px solid #d97706;
      }
      .adm-fer-form-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; font-size: 1.5rem; }
      .adm-fer-form-title { font-size: 1.2rem; font-weight: 700; color: #78350f; margin: 0; }

      .adm-fer-btn-primary {
        background: linear-gradient(135deg, #b45309, #d97706); color: #fff; border: none;
        border-radius: 0.6rem; padding: 0.65rem 1.5rem; font-weight: 700; cursor: pointer;
        box-shadow: 0 3px 10px rgba(180,83,9,0.3); transition: transform 0.15s;
      }
      .adm-fer-btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
      .adm-fer-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .adm-fer-btn-secondary {
        background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a;
        border-radius: 0.6rem; padding: 0.65rem 1.25rem; font-weight: 600; cursor: pointer;
        transition: background 0.15s;
      }
      .adm-fer-btn-secondary:hover { background: #fef3c7; }

      .adm-fer-card {
        background: #fff; border-radius: 1.25rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.07); overflow: hidden;
        transition: transform 0.15s, box-shadow 0.15s;
        border-top: 4px solid #d97706;
      }
      .adm-fer-card-global { border-top-color: #dc2626; }
      .adm-fer-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
      .adm-fer-card-top {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1rem 1.25rem 0.4rem; gap: 0.5rem;
      }
      .adm-fer-date { font-size: 1.05rem; font-weight: 700; color: #1e293b; }
      .adm-fer-badge {
        font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.7rem;
        border-radius: 9999px; white-space: nowrap;
      }
      .adm-fer-badge-global { background: #fee2e2; color: #dc2626; }
      .adm-fer-badge-site   { background: #fef3c7; color: #b45309; }
      .adm-fer-site {
        padding: 0 1.25rem 0.2rem; font-size: 0.85rem; color: #64748b;
      }
      .adm-fer-raison {
        padding: 0.4rem 1.25rem 0.75rem; font-size: 0.88rem; color: #475569;
        border-bottom: 1px solid #fef3c7;
      }
      .adm-fer-card-actions { padding: 0.75rem 1.25rem; }
      .adm-fer-action-delete {
        width: 100%; background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca;
        border-radius: 0.5rem; padding: 0.5rem; font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s;
      }
      .adm-fer-action-delete:hover { background: #fee2e2; }

      .adm-fer-empty {
        text-align: center; padding: 3rem; color: #94a3b8;
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-size: 1.1rem;
      }
      .adm-fer-empty span { font-size: 3rem; }
    </style>
  `
})
export class AdminJoursFermeturePage {
  private readonly joursFermetureApi = inject(JoursFermetureApiService);
  private readonly sitesApi = inject(SitesApiService);
  private readonly adminSession = inject(AdminSessionService);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly jours = signal<JourFermetureResponse[]>([]);
  readonly sites = signal<SiteResponse[]>([]);

  readonly filteredJours = computed(() => {
    if (this.adminSession.isGlobalAdmin()) {
      return this.jours();
    }
    const siteId = this.adminSession.siteId();
    return this.jours().filter((j) => j.global || j.siteId === siteId);
  });

  readonly form = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    raison: new FormControl('', { nonNullable: true }),
    global: new FormControl(false, { nonNullable: true }),
    siteId: new FormControl<number | null>(null)
  });

  constructor() {
    this.loadData();
    if (this.adminSession.isSiteAdmin()) {
      this.form.controls.siteId.setValue(this.adminSession.siteId());
    }
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      jours: this.joursFermetureApi.getAll(),
      sites: this.sitesApi.getAll()
    }).subscribe({
      next: ({ jours, sites }) => {
        this.jours.set(jours);
        this.sites.set(this.adminSession.isGlobalAdmin() ? sites : sites.filter((s) => s.id === this.adminSession.siteId()));
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les jours de fermeture.'));
      }
    });
  }

  onGlobalChange(isGlobal: boolean): void {
    if (isGlobal) {
      this.form.controls.siteId.setValue(null);
    }
  }

  resetForm(): void {
    this.message.set('');
    this.errorMessage.set('');
    this.form.reset({
      date: '',
      raison: '',
      global: false,
      siteId: this.adminSession.isSiteAdmin() ? this.adminSession.siteId() : null
    });
  }

  save(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    this.joursFermetureApi.create({
      date: raw.date,
      raison: raw.raison,
      global: raw.global,
      siteId: raw.global ? null : raw.siteId
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.resetForm();
        this.message.set('Jour de fermeture ajouté.');
        this.loadData();
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Ajout impossible.'));
      }
    });
  }

  remove(id: number): void {
    this.message.set('');
    this.errorMessage.set('');

    this.joursFermetureApi.delete(id).subscribe({
      next: () => {
        this.message.set('Jour de fermeture supprimé.');
        this.loadData();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Suppression impossible.'));
      }
    });
  }
}
