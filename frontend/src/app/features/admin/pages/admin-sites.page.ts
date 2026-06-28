import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { SiteRequest, SiteResponse } from '../../../shared/models/site-terrain.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-admin-sites-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- En-tête sites -->
    <div class="adm-site-header">
      <div class="adm-site-header-inner">
        <div class="adm-site-title-block">
          <span class="adm-site-icon">🏟️</span>
          <div>
            <h1 class="adm-site-title">Gestion des sites</h1>
            <p class="adm-site-sub">Création, édition et suppression des sites</p>
          </div>
        </div>
        <a routerLink="/admin" class="adm-site-back-btn">← Tableau de bord</a>
      </div>
    </div>

    <section class="page-shell">
      <!-- Formulaire -->
      <div class="adm-site-form-card">
        <div class="adm-site-form-header">
          <span>{{ editingId() ? '✏️' : '➕' }}</span>
          <h2 class="adm-site-form-title">{{ editingId() ? 'Modifier un site' : 'Nouveau site' }}</h2>
        </div>
        <form [formGroup]="form" class="grid gap-4 pt-4 md:grid-cols-2" (ngSubmit)="save()">
          <mat-form-field appearance="outline"><mat-label>Nom</mat-label><input matInput formControlName="nom" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Adresse</mat-label><input matInput formControlName="adresse" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Ouverture</mat-label><input matInput type="time" formControlName="heureOuverture" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Fermeture</mat-label><input matInput type="time" formControlName="heureFermeture" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Durée match (min)</mat-label><input matInput type="number" formControlName="dureeMatchMinutes" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Pause entre matchs (min)</mat-label><input matInput type="number" formControlName="dureeEntreMatchMinutes" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Année civile</mat-label><input matInput type="number" formControlName="anneeCivile" /></mat-form-field>

          @if (message()) {
            <div class="status-success md:col-span-2">✅ {{ message() }}</div>
          }
          @if (errorMessage()) {
            <div class="status-error md:col-span-2">❌ {{ errorMessage() }}</div>
          }

          <div class="flex flex-wrap items-center gap-3 md:col-span-2">
            <button class="adm-site-btn-primary" type="submit" [disabled]="loading() || form.invalid">
              {{ editingId() ? '💾 Enregistrer' : '➕ Créer le site' }}
            </button>
            <button class="adm-site-btn-secondary" type="button" (click)="resetForm()">🔄 Réinitialiser</button>
            @if (loading()) { <mat-spinner diameter="24"></mat-spinner> }
          </div>
        </form>
      </div>

      <!-- Liste des sites -->
      <div class="grid gap-5 md:grid-cols-2">
        @for (site of sites(); track site.id) {
          <div class="adm-site-card">
            <div class="adm-site-card-header">
              <div>
                <div class="adm-site-card-name">🏟️ {{ site.nom }}</div>
                <div class="adm-site-card-addr">📍 {{ site.adresse }}</div>
              </div>
            </div>
            <div class="adm-site-info-grid">
              <div class="adm-site-info-item adm-site-info-teal">
                <span class="adm-site-info-label">🕐 Horaires</span>
                <span class="adm-site-info-val">{{ site.heureOuverture }} – {{ site.heureFermeture }}</span>
              </div>
              <div class="adm-site-info-item adm-site-info-violet">
                <span class="adm-site-info-label">⏱ Durée match</span>
                <span class="adm-site-info-val">{{ site.dureeMatchMinutes }} min</span>
              </div>
              <div class="adm-site-info-item adm-site-info-amber">
                <span class="adm-site-info-label">⏸ Pause</span>
                <span class="adm-site-info-val">{{ site.dureeEntreMatchMinutes }} min</span>
              </div>
              <div class="adm-site-info-item adm-site-info-blue">
                <span class="adm-site-info-label">📅 Année</span>
                <span class="adm-site-info-val">{{ site.anneeCivile }}</span>
              </div>
            </div>
            <div class="adm-site-card-actions">
              <button class="adm-site-action-edit" type="button" (click)="edit(site)">✏️ Modifier</button>
              <button class="adm-site-action-delete" type="button" (click)="remove(site.id)">🗑️ Supprimer</button>
            </div>
          </div>
        } @empty {
          <div class="adm-site-empty md:col-span-2">
            <span>🏟️</span>
            <p>Aucun site configuré</p>
          </div>
        }
      </div>
    </section>

    <style>
      .adm-site-header {
        background: linear-gradient(135deg, #2e1065 0%, #5b21b6 50%, #7c3aed 100%);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 16px rgba(91,33,182,0.3);
      }
      .adm-site-header-inner {
        display: flex; align-items: center; justify-content: space-between;
        max-width: 1200px; margin: 0 auto; gap: 1rem; flex-wrap: wrap;
      }
      .adm-site-title-block { display: flex; align-items: center; gap: 1rem; }
      .adm-site-icon { font-size: 2.5rem; }
      .adm-site-title { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
      .adm-site-sub { color: rgba(255,255,255,0.75); font-size: 0.85rem; margin: 0; }
      .adm-site-back-btn {
        background: rgba(255,255,255,0.15); color: #fff; border: 2px solid rgba(255,255,255,0.35);
        border-radius: 9999px; padding: 0.45rem 1.1rem; font-weight: 700;
        font-size: 0.85rem; text-decoration: none; transition: background 0.15s; white-space: nowrap;
      }
      .adm-site-back-btn:hover { background: rgba(255,255,255,0.25); }

      .adm-site-form-card {
        background: #fff; border-radius: 1.25rem;
        box-shadow: 0 4px 20px rgba(91,33,182,0.1);
        padding: 1.5rem; border-left: 5px solid #7c3aed;
      }
      .adm-site-form-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; font-size: 1.5rem; }
      .adm-site-form-title { font-size: 1.2rem; font-weight: 700; color: #2e1065; margin: 0; }

      .adm-site-btn-primary {
        background: linear-gradient(135deg, #5b21b6, #7c3aed); color: #fff; border: none;
        border-radius: 0.6rem; padding: 0.65rem 1.5rem; font-weight: 700; cursor: pointer;
        box-shadow: 0 3px 10px rgba(91,33,182,0.3); transition: transform 0.15s;
      }
      .adm-site-btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
      .adm-site-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .adm-site-btn-secondary {
        background: #f5f3ff; color: #5b21b6; border: 1.5px solid #ddd6fe;
        border-radius: 0.6rem; padding: 0.65rem 1.25rem; font-weight: 600; cursor: pointer;
        transition: background 0.15s;
      }
      .adm-site-btn-secondary:hover { background: #ede9fe; }

      .adm-site-card {
        background: #fff; border-radius: 1.25rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.07);
        overflow: hidden; transition: transform 0.15s, box-shadow 0.15s;
        border-top: 4px solid #7c3aed;
      }
      .adm-site-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
      .adm-site-card-header { padding: 1rem 1.25rem 0.5rem; }
      .adm-site-card-name { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
      .adm-site-card-addr { font-size: 0.85rem; color: #64748b; margin-top: 0.15rem; }

      .adm-site-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; padding: 0.5rem 1.25rem 0.75rem; }
      .adm-site-info-item {
        border-radius: 0.6rem; padding: 0.5rem 0.75rem;
        display: flex; flex-direction: column; gap: 0.1rem;
      }
      .adm-site-info-label { font-size: 0.72rem; font-weight: 600; opacity: 0.75; }
      .adm-site-info-val { font-size: 0.9rem; font-weight: 700; }
      .adm-site-info-teal   { background: #f0fdfa; color: #0f766e; }
      .adm-site-info-violet { background: #f5f3ff; color: #5b21b6; }
      .adm-site-info-amber  { background: #fffbeb; color: #b45309; }
      .adm-site-info-blue   { background: #eff6ff; color: #1d4ed8; }

      .adm-site-card-actions {
        display: flex; gap: 0.75rem; padding: 0.75rem 1.25rem;
        border-top: 1px solid #f1f5f9; flex-wrap: wrap;
      }
      .adm-site-action-edit {
        flex: 1; min-width: 100px; background: #eff6ff; color: #1d4ed8;
        border: 1.5px solid #bfdbfe; border-radius: 0.5rem; padding: 0.45rem 0.75rem;
        font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.15s;
      }
      .adm-site-action-edit:hover { background: #dbeafe; }
      .adm-site-action-delete {
        flex: 1; min-width: 100px; background: #fef2f2; color: #dc2626;
        border: 1.5px solid #fecaca; border-radius: 0.5rem; padding: 0.45rem 0.75rem;
        font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.15s;
      }
      .adm-site-action-delete:hover { background: #fee2e2; }

      .adm-site-empty {
        text-align: center; padding: 3rem; color: #94a3b8;
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-size: 1.1rem;
      }
      .adm-site-empty span { font-size: 3rem; }
    </style>
  `
})
export class AdminSitesPage {
  private readonly sitesApi = inject(SitesApiService);
  private readonly adminSession = inject(AdminSessionService);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly editingId = signal<number | null>(null);
  readonly sites = signal<SiteResponse[]>([]);

  readonly form = new FormGroup({
    nom: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    adresse: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    heureOuverture: new FormControl('08:00', { nonNullable: true, validators: [Validators.required] }),
    heureFermeture: new FormControl('22:00', { nonNullable: true, validators: [Validators.required] }),
    dureeMatchMinutes: new FormControl(90, { nonNullable: true, validators: [Validators.required] }),
    dureeEntreMatchMinutes: new FormControl(15, { nonNullable: true, validators: [Validators.required] }),
    anneeCivile: new FormControl(new Date().getFullYear(), { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    this.loadSites();
  }

  loadSites(): void {
    this.sitesApi.getAll().subscribe({
      next: (sites) => {
        this.sites.set(this.adminSession.isGlobalAdmin() ? sites : sites.filter((site) => site.id === this.adminSession.siteId()));
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les sites.'));
      }
    });
  }

  edit(site: SiteResponse): void {
    this.editingId.set(site.id);
    this.form.patchValue({ ...site });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      nom: '',
      adresse: '',
      heureOuverture: '08:00',
      heureFermeture: '22:00',
      dureeMatchMinutes: 90,
      dureeEntreMatchMinutes: 15,
      anneeCivile: new Date().getFullYear()
    });
  }

  save(): void {
    if (this.form.invalid || this.loading() || this.adminSession.isSiteAdmin()) {
      if (this.adminSession.isSiteAdmin()) {
        this.errorMessage.set('Un admin SITE ne peut pas modifier les sites.');
      }
      return;
    }

    this.loading.set(true);
    const payload = this.form.getRawValue() as SiteRequest;
    const request$ = this.editingId() ? this.sitesApi.update(this.editingId()!, payload) : this.sitesApi.create(payload);
    request$.subscribe({
      next: () => {
        const wasEditing = this.editingId() !== null;
        this.loading.set(false);
        this.resetForm();
        this.message.set(wasEditing ? 'Site mis à jour.' : 'Site créé.');
        this.loadSites();
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Sauvegarde du site impossible.'));
      }
    });
  }

  remove(id: number): void {
    if (this.adminSession.isSiteAdmin()) {
      this.errorMessage.set('Un admin SITE ne peut pas supprimer de site.');
      return;
    }

    this.sitesApi.delete(id).subscribe({
      next: () => {
        this.message.set('Site supprimé.');
        this.loadSites();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Suppression du site impossible.'));
      }
    });
  }
}
