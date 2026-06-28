import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { MembreRequest, MembreResponse } from '../../../shared/models/membre.model';
import { TypeMembre } from '../../../shared/models/enums.model';
import { SiteResponse } from '../../../shared/models/site-terrain.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-admin-members-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- En-tête padel admin -->
    <div class="adm-header">
      <div class="adm-header-content">
        <div class="adm-header-left">
          <span class="adm-icon">🎾</span>
          <div>
            <h1 class="adm-title ds-section-title">Gestion des membres</h1>
            <p class="adm-sub ds-subtitle">Création, modification et suppression des membres du club</p>
          </div>
        </div>
        <a mat-stroked-button routerLink="/admin" class="adm-back-btn">← Tableau de bord</a>
      </div>
    </div>

    <section class="page-shell">

      <!-- Formulaire création/édition -->
      <div class="adm-form-card">
        <div class="adm-form-header">
          <span class="adm-form-icon">{{ editingId() ? '✏️' : '➕' }}</span>
          <h2 class="adm-form-title">{{ editingId() ? 'Modifier un membre' : 'Nouveau membre' }}</h2>
        </div>

        <form [formGroup]="form" class="grid gap-4 pt-4 md:grid-cols-2" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Matricule</mat-label>
            <input matInput formControlName="matricule" [readonly]="editingId() !== null"
                   placeholder="G1234 / S12345 / L12345"
                   class="uppercase font-semibold tracking-wider" />
            @if (!editingId()) {
              <mat-hint>GLOBAL: G+4ch · SITE: S+5ch · LIBRE: L+5ch</mat-hint>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type de membre</mat-label>
            <mat-select formControlName="typeMembre" [disabled]="editingId() !== null">
              <mat-option value="GLOBAL">🌍 GLOBAL — Tous les sites</mat-option>
              <mat-option value="SITE">🏟️ SITE — Site dédié</mat-option>
              <mat-option value="LIBRE">⚡ LIBRE — Accès libre</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" placeholder="Dupont" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom" placeholder="Jean" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="jean.dupont@email.com" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Site</mat-label>
            <mat-select formControlName="siteId">
              <mat-option [value]="null">🌐 Aucun site (GLOBAL / LIBRE)</mat-option>
              @for (site of sites(); track site.id) {
                <mat-option [value]="site.id">🏟️ {{ site.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (message()) {
            <div class="status-success md:col-span-2">✅ {{ message() }}</div>
          }
          @if (errorMessage()) {
            <div class="status-error md:col-span-2">❌ {{ errorMessage() }}</div>
          }

          <div class="flex items-center gap-3 md:col-span-2">
            <button class="adm-btn-primary" type="submit" [disabled]="loading() || form.invalid">
              {{ editingId() ? '💾 Enregistrer' : '➕ Créer le membre' }}
            </button>
            <button class="adm-btn-secondary" type="button" (click)="resetForm()">🔄 Réinitialiser</button>
            @if (loading()) {
              <mat-spinner diameter="24"></mat-spinner>
            }
          </div>
        </form>
      </div>

      <!-- Recherche par matricule -->
      <div class="adm-search-bar">
        <span class="adm-search-icon">🔍</span>
        <input
          class="adm-search-input"
          type="text"
          placeholder="Rechercher par matricule, nom ou prénom..."
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)" />
        @if (searchQuery()) {
          <button class="adm-search-clear" (click)="searchQuery.set('')">✕</button>
        }
        <span class="adm-search-count">{{ displayedMembers().length }} membre(s)</span>
      </div>

      <!-- Filtres par type -->
      <div class="adm-type-filters">
        <button class="adm-filter-btn" [class.active]="typeFilter() === ''" (click)="typeFilter.set('')">
          Tous ({{ filteredMembers().length }})
        </button>
        <button class="adm-filter-btn adm-filter-global" [class.active]="typeFilter() === 'GLOBAL'" (click)="typeFilter.set('GLOBAL')">
          🌍 GLOBAL ({{ countByType('GLOBAL') }})
        </button>
        <button class="adm-filter-btn adm-filter-site" [class.active]="typeFilter() === 'SITE'" (click)="typeFilter.set('SITE')">
          🏟️ SITE ({{ countByType('SITE') }})
        </button>
        <button class="adm-filter-btn adm-filter-libre" [class.active]="typeFilter() === 'LIBRE'" (click)="typeFilter.set('LIBRE')">
          ⚡ LIBRE ({{ countByType('LIBRE') }})
        </button>
      </div>

      <!-- Liste des membres -->
      @if (displayedMembers().length === 0) {
        <div class="adm-empty">
          <span class="adm-empty-icon">🎾</span>
          <p class="adm-empty-title">Aucun membre trouvé</p>
          <p class="adm-empty-sub">{{ searchQuery() ? 'Aucun résultat pour "' + searchQuery() + '"' : 'Créez votre premier membre avec le formulaire ci-dessus.' }}</p>
        </div>
      }

      <div class="grid gap-4 md:grid-cols-2">
        @for (member of displayedMembers(); track member.id) {
          <div class="adm-member-card" [class]="'adm-member-' + member.typeMembre.toLowerCase()">
            <div class="adm-member-top">
              <div class="adm-member-avatar">
                {{ member.typeMembre === 'GLOBAL' ? '🌍' : member.typeMembre === 'SITE' ? '🏟️' : '⚡' }}
              </div>
              <div class="adm-member-info">
                <div class="adm-member-name">{{ member.prenom }} {{ member.nom }}</div>
                <div class="adm-member-matricule">{{ member.matricule }}</div>
              </div>
              <span class="ds-badge" [class]="typeBadgeClass(member.typeMembre)">
                {{ member.typeMembre }}
              </span>
              @if (hasActivePenalty(member.id)) {
                <span class="adm-penalty-badge">Pénalité active</span>
              }
            </div>

            <div class="adm-member-details ds-data-list">
              <div class="adm-detail-row ds-data-row">
                <span class="ds-data-key">Email</span>
                <span class="ds-data-value">{{ member.email || 'Non renseigné' }}</span>
              </div>
              <div class="adm-detail-row ds-data-row">
                <span class="ds-data-key">Site</span>
                <span class="ds-data-value">{{ member.siteNom || 'Tous les sites' }}</span>
              </div>
              <div class="adm-detail-row ds-data-row">
                <span class="ds-data-key">Solde</span>
                <span class="ds-data-value">{{ member.solde }} EUR</span>
              </div>
            </div>

            <div class="adm-member-actions">
              <button class="adm-action-edit" (click)="edit(member)">✏️ Modifier</button>
              <button class="adm-action-delete" (click)="remove(member.id)">🗑️ Supprimer</button>
            </div>
          </div>
        }
      </div>
    </section>

    <style>
      .adm-header {
        background: linear-gradient(135deg, #14532d 0%, #15803d 50%, #166534 100%);
        padding: 1.5rem 2rem;
      }
      .adm-header-content { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
      .adm-header-left { display: flex; align-items: center; gap: 1rem; }
      .adm-icon { font-size: 2.5rem; }
      .adm-title { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
      .adm-sub { color: rgba(255,255,255,0.75); font-size: 0.85rem; margin: 0; }
      .adm-back-btn { color: #fff !important; border-color: rgba(255,255,255,0.4) !important; }

      .adm-form-card {
        background: #fff; border-radius: 1.25rem;
        box-shadow: 0 4px 20px rgba(21,128,61,0.1);
        padding: 1.5rem; border-left: 5px solid #16a34a;
      }
      .adm-form-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
      .adm-form-icon { font-size: 1.5rem; }
      .adm-form-title { font-size: 1.2rem; font-weight: 700; color: #14532d; margin: 0; }

      .adm-success { background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.75rem; padding: 0.75rem 1rem; color: #14532d; font-size: 0.9rem; }
      .adm-error   { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 0.75rem; padding: 0.75rem 1rem; color: #991b1b; font-size: 0.9rem; }

      .adm-btn-primary {
        background: linear-gradient(135deg, #15803d, #16a34a); color: #fff; border: none;
        border-radius: 0.6rem; padding: 0.65rem 1.5rem; font-weight: 700; cursor: pointer;
        box-shadow: 0 3px 10px rgba(21,128,61,0.3); transition: transform 0.15s;
      }
      .adm-btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
      .adm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .adm-btn-secondary {
        background: #f8fafc; color: #475569; border: 1px solid #cbd5e1;
        border-radius: 0.6rem; padding: 0.65rem 1.25rem; font-weight: 600; cursor: pointer;
        transition: background 0.15s;
      }
      .adm-btn-secondary:hover { background: #f1f5f9; }

      .adm-search-bar {
        display: flex; align-items: center; gap: 0.75rem;
        background: #fff; border: 2px solid #86efac; border-radius: 1rem;
        padding: 0.6rem 1rem; box-shadow: 0 2px 8px rgba(21,128,61,0.1);
      }
      .adm-search-icon { font-size: 1.1rem; }
      .adm-search-input {
        flex: 1; border: none; outline: none; font-size: 0.95rem; background: transparent; color: #1e293b;
      }
      .adm-search-clear {
        background: #fee2e2; border: none; border-radius: 50%; width: 1.5rem; height: 1.5rem;
        cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;
      }
      .adm-search-count {
        font-size: 0.8rem; color: #64748b; white-space: nowrap;
        background: #f0fdf4; padding: 0.2rem 0.6rem; border-radius: 9999px;
      }

      .adm-type-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .adm-filter-btn {
        padding: 0.4rem 1rem; border-radius: 9999px; border: 2px solid #e2e8f0;
        background: #fff; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
        color: #475569;
      }
      .adm-filter-btn.active, .adm-filter-btn:hover { border-color: #16a34a; background: #f0fdf4; color: #14532d; }
      .adm-filter-global.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
      .adm-filter-site.active   { border-color: #16a34a; background: #f0fdf4; color: #14532d; }
      .adm-filter-libre.active  { border-color: #eab308; background: #fefce8; color: #a16207; }

      .adm-empty { text-align: center; padding: 3rem 1rem; }
      .adm-empty-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
      .adm-empty-title { font-size: 1.1rem; font-weight: 700; color: #374151; margin: 0 0 0.35rem; }
      .adm-empty-sub { color: #9ca3af; font-size: 0.9rem; margin: 0; }

      .adm-member-card {
        background: #fff; border-radius: 1.25rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.07);
        overflow: hidden; transition: transform 0.15s, box-shadow 0.15s;
        border-top: 4px solid #e2e8f0;
      }
      .adm-member-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
      .adm-member-global { border-top-color: #3b82f6; }
      .adm-member-site   { border-top-color: #16a34a; }
      .adm-member-libre  { border-top-color: #eab308; }

      .adm-member-top { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem 0.5rem; }
      .adm-member-avatar { font-size: 2rem; }
      .adm-member-info { flex: 1; }
      .adm-member-name { font-size: 1rem; font-weight: 700; color: #1e293b; }
      .adm-member-matricule { font-size: 0.85rem; color: #64748b; font-family: monospace; letter-spacing: 0.05em; }

      .adm-member-badge {
        display: inline-block; padding: 0.2rem 0.7rem; border-radius: 9999px;
        font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em;
      }
      .adm-badge-global { background: #dbeafe; color: #1d4ed8; }
      .adm-badge-site   { background: #dcfce7; color: #15803d; }
      .adm-badge-libre  { background: #fef9c3; color: #a16207; }
      .adm-penalty-badge {
        display: inline-flex; align-items: center; gap: 0.25rem;
        background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
        padding: 0.2rem 0.65rem; border-radius: 9999px;
        font-size: 0.72rem; font-weight: 800; white-space: nowrap;
      }

      .adm-member-details { padding: 0.5rem 1.25rem 0.75rem; display: flex; flex-direction: column; gap: 0.3rem; }
      .adm-detail-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #475569; }

      .adm-member-actions {
        display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem;
        border-top: 1px solid #f1f5f9;
      }
      .adm-action-edit {
        flex: 1; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;
        border-radius: 0.5rem; padding: 0.4rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
        transition: background 0.15s;
      }
      .adm-action-edit:hover { background: #dbeafe; }
      .adm-action-delete {
        flex: 1; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
        border-radius: 0.5rem; padding: 0.4rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
        transition: background 0.15s;
      }
      .adm-action-delete:hover { background: #fee2e2; }
    </style>
  `
})
export class AdminMembersPage {
  private readonly membresApi = inject(MembresApiService);
  private readonly sitesApi = inject(SitesApiService);
  private readonly adminSession = inject(AdminSessionService);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly editingId = signal<number | null>(null);
  readonly members = signal<MembreResponse[]>([]);
  readonly sites = signal<SiteResponse[]>([]);
  readonly searchQuery = signal('');
  readonly typeFilter = signal('');
  readonly penalizedMemberIds = signal<Set<number>>(new Set());

  readonly filteredMembers = computed(() => {
    const siteId = this.adminSession.siteId();
    if (this.adminSession.isGlobalAdmin() || !siteId) {
      return this.members();
    }
    return this.members().filter((m) => m.siteId === siteId || m.siteId === null);
  });

  readonly displayedMembers = computed(() => {
    let list = this.filteredMembers();
    const q = this.searchQuery().trim().toUpperCase();
    const t = this.typeFilter();
    if (q) {
      list = list.filter(m =>
        m.matricule.toUpperCase().includes(q) ||
        m.nom.toUpperCase().includes(q) ||
        m.prenom.toUpperCase().includes(q)
      );
    }
    if (t) {
      list = list.filter(m => m.typeMembre === t);
    }
    return list;
  });

  countByType(type: string): number {
    return this.filteredMembers().filter(m => m.typeMembre === type).length;
  }

  typeBadgeClass(type: TypeMembre): string {
    if (type === 'GLOBAL') {
      return 'ds-badge-info';
    }
    if (type === 'SITE') {
      return 'ds-badge-success';
    }
    return 'ds-badge-warning';
  }

  hasActivePenalty(memberId: number): boolean {
    return this.penalizedMemberIds().has(memberId);
  }

  readonly form = new FormGroup({
    matricule: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nom: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    prenom: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    typeMembre: new FormControl<TypeMembre>('GLOBAL', { nonNullable: true, validators: [Validators.required] }),
    siteId: new FormControl<number | null>(null)
  });

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.penalizedMemberIds.set(new Set());
    forkJoin({
      members: this.membresApi.getAll(),
      sites: this.sitesApi.getAll()
    }).subscribe({
      next: ({ members, sites }) => {
        this.members.set(members);
        this.sites.set(this.adminSession.isGlobalAdmin() ? sites : sites.filter((s) => s.id === this.adminSession.siteId()));
        this.loadPenaltyStatuses(members);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.penalizedMemberIds.set(new Set());
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les membres.'));
      }
    });
  }

  private loadPenaltyStatuses(members: MembreResponse[]): void {
    if (members.length === 0) {
      this.penalizedMemberIds.set(new Set());
      return;
    }

    forkJoin(members.map((member) =>
      this.membresApi.hasPenalty(member.id).pipe(
        map((hasPenalty) => ({ id: member.id, hasPenalty })),
        catchError(() => of({ id: member.id, hasPenalty: false }))
      )
    )).subscribe((statuses) => {
      this.penalizedMemberIds.set(new Set(
        statuses
          .filter((status) => status.hasPenalty)
          .map((status) => status.id)
      ));
    });
  }

  edit(member: MembreResponse): void {
    this.editingId.set(member.id);
    this.form.patchValue({
      matricule: member.matricule,
      nom: member.nom,
      prenom: member.prenom,
      email: member.email,
      typeMembre: member.typeMembre,
      siteId: member.siteId
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.message.set('');
    this.errorMessage.set('');
    this.form.reset({
      matricule: '',
      nom: '',
      prenom: '',
      email: '',
      typeMembre: this.adminSession.isSiteAdmin() ? 'SITE' : 'GLOBAL',
      siteId: this.adminSession.isSiteAdmin() ? this.adminSession.siteId() : null
    });
  }

  save(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.message.set('');
    this.errorMessage.set('');

    const payload = this.form.getRawValue() as MembreRequest;
    if (this.adminSession.isSiteAdmin()) {
      payload.siteId = this.adminSession.siteId() ?? undefined;
      payload.typeMembre = 'SITE';
    }

    const request$ = this.editingId()
      ? this.membresApi.update(this.editingId()!, payload)
      : this.membresApi.create(payload);

    request$.subscribe({
      next: () => {
        const wasEditing = this.editingId() !== null;
        this.loading.set(false);
        this.resetForm();
        this.message.set(wasEditing ? '✅ Membre mis à jour.' : '✅ Membre créé avec succès.');
        this.loadData();
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Sauvegarde du membre impossible.'));
      }
    });
  }

  remove(id: number): void {
    if (!confirm('Confirmer la suppression de ce membre ?')) return;
    this.loading.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.membresApi.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('🗑️ Membre supprimé.');
        this.loadData();
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Suppression impossible.'));
      }
    });
  }
}
