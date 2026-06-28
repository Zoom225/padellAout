import { StatutMatch, TypeMatch } from './enums.model';

export interface MatchRequest {
  terrainId: number;
  organisateurId: number;
  date: string;
  heureDebut: string;
  typeMatch: TypeMatch;
}

export interface MatchResponse {
  id: number;
  terrainId: number;
  terrainNom: string;
  siteNom: string;
  organisateurId: number;
  organisateurNom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  typeMatch: TypeMatch;
  statut: StatutMatch;
  nbJoueursActuels: number;
  prixParJoueur: number;
  dateConversionPublic: string | null;
}

export interface CreateMatchRequest {
  terrainId: number;
  matchDate: string;
  matchType: TypeMatch;
}
