import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { PaiementsApiService } from '../../../core/api/paiements-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { PaiementResponse } from '../../../shared/models/reservation.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-member-payments-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  template: `
    <!-- Hero paiements -->
    <div class="pay-hero">
      <div class="pay-hero-inner">
        <div class="pay-hero-left">
          <span class="pay-hero-icon">💳</span>
          <div>
            <h1 class="pay-hero-title">Mes paiements</h1>
            <p class="pay-hero-sub">Historique des paiements et remboursements</p>
          </div>
        </div>
        <a routerLink="/member/reservations" class="pay-hero-link">📋 Mes réservations</a>
      </div>
    </div>

    <section class="page-shell max-w-5xl">

      @if (loading()) {
        <div class="flex justify-center py-8"><mat-spinner diameter="32"></mat-spinner></div>
      }
      @if (errorMessage()) {
        <p class="status-error">{{ errorMessage() }}</p>
      }

      <!-- KPI -->
      <div class="pay-kpi-card">
        <div class="pay-kpi-grid">
          <div class="pay-kpi-item">
            <p class="pay-kpi-label">Total paiements</p>
            <p class="pay-kpi-value">{{ payments().length }}</p>
          </div>
          <div class="pay-kpi-item">
            <p class="pay-kpi-label">Total payé</p>
            <p class="pay-kpi-value">{{ totalPaid() }} €</p>
          </div>
          <div class="pay-kpi-item">
            <p class="pay-kpi-label">En attente</p>
            <p class="pay-kpi-value">{{ pendingCount() }}</p>
          </div>
          <div class="pay-kpi-item">
            <p class="pay-kpi-label">Remboursés</p>
            <p class="pay-kpi-value">{{ refundedCount() }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        @for (payment of payments(); track payment.id) {
          <div class="pay-card">
            <div class="pay-card-header">
              <div class="pay-card-id">Paiement #{{ payment.id }}</div>
              <div class="pay-card-date">{{ payment.datePaiement || 'Pas encore réglé' }}</div>
            </div>
            <div class="pay-card-body">
              <span class="pay-amount">{{ payment.montant }} €</span>
              <span class="pay-badge" [class]="payBadgeClass(payment.statut)">{{ payment.statut }}</span>
            </div>
          </div>
        } @empty {
          @if (!loading()) {
            <div class="pay-empty md:col-span-2">
              <span>💳</span>
              <p>Aucun paiement trouvé</p>
            </div>
          }
        }
      </div>
    </section>

    <style>
      .pay-hero {
        background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 20px rgba(109,40,217,0.3);
      }
      .pay-hero-inner {
        display: flex; align-items: center; justify-content: space-between;
        max-width: 1200px; margin: 0 auto; gap: 1rem; flex-wrap: wrap;
      }
      .pay-hero-left { display: flex; align-items: center; gap: 1rem; }
      .pay-hero-icon { font-size: 2.5rem; }
      .pay-hero-title { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
      .pay-hero-sub { color: rgba(255,255,255,0.75); font-size: 0.85rem; margin: 0; }
      .pay-hero-link {
        background: rgba(255,255,255,0.15); color: #fff; border: 2px solid rgba(255,255,255,0.35);
        border-radius: 9999px; padding: 0.45rem 1.1rem; font-weight: 700;
        font-size: 0.85rem; text-decoration: none; transition: background 0.15s; white-space: nowrap;
      }
      .pay-hero-link:hover { background: rgba(255,255,255,0.25); }

      .pay-kpi-card {
        background: linear-gradient(135deg, #f5f3ff, #ede9fe);
        border: 1.5px solid #c4b5fd; border-radius: 1.25rem;
        padding: 1.25rem 1.5rem; box-shadow: 0 4px 12px rgba(109,40,217,0.1);
      }
      .pay-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
      .pay-kpi-item { text-align: center; }
      .pay-kpi-label { font-size: 0.8rem; color: #6d28d9; font-weight: 600; margin: 0 0 0.25rem; }
      .pay-kpi-value { font-size: 1.75rem; font-weight: 800; color: #4c1d95; margin: 0; }

      .pay-card {
        background: #fff; border-radius: 1.25rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.07); overflow: hidden;
        border-top: 4px solid #7c3aed; transition: transform 0.15s, box-shadow 0.15s;
      }
      .pay-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
      .pay-card-header { padding: 1rem 1.25rem 0.25rem; }
      .pay-card-id { font-weight: 800; font-size: 0.95rem; color: #4c1d95; }
      .pay-card-date { font-size: 0.8rem; color: #94a3b8; }
      .pay-card-body { padding: 0.5rem 1.25rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
      .pay-amount { font-size: 1.35rem; font-weight: 800; color: #1e293b; }
      .pay-badge {
        font-size: 0.72rem; font-weight: 800; padding: 0.25rem 0.75rem;
        border-radius: 9999px; white-space: nowrap;
      }
      .pay-badge-paye     { background: #dcfce7; color: #15803d; }
      .pay-badge-attente  { background: #fef3c7; color: #b45309; }
      .pay-badge-rembourse { background: #dbeafe; color: #1d4ed8; }
      .pay-badge-default  { background: #f1f5f9; color: #475569; }

      .pay-empty {
        text-align: center; padding: 3rem; color: #94a3b8;
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-size: 1.1rem;
        background: #faf5ff; border-radius: 1.25rem; border: 2px dashed #c4b5fd;
      }
      .pay-empty span { font-size: 3rem; }
    </style>
  `
})
export class MemberPaymentsPage {
  private readonly paiementsApi = inject(PaiementsApiService);
  private readonly memberSession = inject(MemberSessionService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly payments = signal<PaiementResponse[]>([]);
  readonly memberId = computed(() => this.memberSession.memberId());
  readonly totalPaid = computed(() =>
    this.payments()
      .filter((payment) => payment.statut === 'PAYE')
      .reduce((sum, payment) => sum + payment.montant, 0)
  );
  readonly pendingCount = computed(() => this.payments().filter((payment) => payment.statut === 'EN_ATTENTE').length);
  readonly refundedCount = computed(() => this.payments().filter((payment) => payment.statut === 'REMBOURSE').length);

  constructor() {
    this.loadPayments();
  }

  loadPayments(): void {
    const memberId = this.memberId();
    if (!memberId) {
      this.errorMessage.set('Aucun membre connecté.');
      return;
    }

    this.loading.set(true);
    this.paiementsApi.getByMembre(memberId).subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Impossible de charger les paiements.'));
      }
    });
  }

  payBadgeClass(statut: string): string {
    switch (statut) {
      case 'PAYE': return 'pay-badge pay-badge-paye';
      case 'EN_ATTENTE': return 'pay-badge pay-badge-attente';
      case 'REMBOURSE': return 'pay-badge pay-badge-rembourse';
      default: return 'pay-badge pay-badge-default';
    }
  }
}
