import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaiementsApiService } from '../../../core/api/paiements-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { PaiementResponse } from '../../../shared/models/reservation.model';
import { MemberPaymentsPage } from './member-payments.page';

describe('MemberPaymentsPage', () => {
  const pendingPayment: PaiementResponse = {
    id: 10,
    reservationId: 22,
    montant: 15,
    statut: 'EN_ATTENTE',
    datePaiement: null
  };

  const paidPayment: PaiementResponse = {
    id: 10,
    reservationId: 22,
    montant: 15,
    statut: 'PAYE',
    datePaiement: '2026-08-04T19:00:00'
  };

  let paiementsApiMock: {
    getByMembre: ReturnType<typeof vi.fn>;
    pay: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    paiementsApiMock = {
      getByMembre: vi.fn().mockReturnValue(of([pendingPayment])),
      pay: vi.fn().mockReturnValue(of(paidPayment))
    };

    await TestBed.configureTestingModule({
      imports: [MemberPaymentsPage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: PaiementsApiService, useValue: paiementsApiMock },
        { provide: MemberSessionService, useValue: { memberId: vi.fn().mockReturnValue(1) } }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('permet de payer un paiement en attente et affiche une confirmation', () => {
    const fixture = TestBed.createComponent(MemberPaymentsPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.pay(pendingPayment);

    expect(paiementsApiMock.pay).toHaveBeenCalledWith(22);
    expect(component.message()).toContain('Paiement effectue avec succes');
    expect(component.payments()[0].statut).toBe('PAYE');
  });
});
