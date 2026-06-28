export interface SiteRequest {
  nom: string;
  adresse: string;
  heureOuverture: string;
  heureFermeture: string;
  dureeMatchMinutes: number;
  dureeEntreMatchMinutes: number;
  anneeCivile: number;
}

export interface SiteResponse {
  id: number;
  nom: string;
  adresse: string;
  heureOuverture: string;
  heureFermeture: string;
  dureeMatchMinutes: number;
  dureeEntreMatchMinutes: number;
  anneeCivile: number;
}

export interface TerrainRequest {
  nom: string;
  siteId: number;
}

export interface TerrainResponse {
  id: number;
  nom: string;
  siteId: number;
  siteNom: string;
  prix: number | null;
}

export interface JourFermetureRequest {
  date: string;
  raison: string;
  global: boolean;
  siteId: number | null;
}

export interface JourFermetureResponse {
  id: number;
  date: string;
  raison: string | null;
  global: boolean;
  siteId: number | null;
  siteNom: string | null;
}
