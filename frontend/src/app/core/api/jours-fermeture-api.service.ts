import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JourFermetureRequest, JourFermetureResponse } from '../../shared/models/site-terrain.model';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class JoursFermetureApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<JourFermetureResponse[]> {
    return this.http.get<JourFermetureResponse[]>(apiUrl('/jours-fermeture'));
  }

  getGlobal(): Observable<JourFermetureResponse[]> {
    return this.http.get<JourFermetureResponse[]>(apiUrl('/jours-fermeture/global'));
  }

  getBySite(siteId: number): Observable<JourFermetureResponse[]> {
    return this.http.get<JourFermetureResponse[]>(apiUrl(`/jours-fermeture/site/${siteId}`));
  }

  create(payload: JourFermetureRequest): Observable<JourFermetureResponse> {
    return this.http.post<JourFermetureResponse>(apiUrl('/jours-fermeture'), payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/jours-fermeture/${id}`));
  }
}

