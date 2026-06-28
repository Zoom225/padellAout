import { StatutPaiement, StatutReservation } from './enums.model';

export interface ReservationRequest {
  matchId: number;
  membreId: number;
  requesterId: number;
}

export interface PaiementResponse {
  id: number;
  montant: number;
  statut: StatutPaiement;
  datePaiement: string | null;
}

export interface ReservationResponse {
  id: number;
  matchId: number;
  matchDateTime: string;
  membreId: number;
  membreNom: string;
  statut: StatutReservation;
  paiement: PaiementResponse | null;
}

