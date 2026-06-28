import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MembreRequest, MembreResponse } from '../../shared/models/membre.model';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class MembresApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<MembreResponse[]> {
    return this.http.get<MembreResponse[]>(apiUrl('/membres'));
  }

  getById(id: number): Observable<MembreResponse> {
    return this.http.get<MembreResponse>(apiUrl(`/membres/${id}`));
  }

  getByMatricule(matricule: string): Observable<MembreResponse> {
    return this.http.get<MembreResponse>(apiUrl(`/membres/matricule/${matricule}`));
  }

  hasPenalty(id: number): Observable<boolean> {
    return this.http.get<boolean>(apiUrl(`/membres/${id}/penalty`));
  }

  hasBalance(id: number): Observable<boolean> {
    return this.http.get<boolean>(apiUrl(`/membres/${id}/balance`));
  }

  create(payload: MembreRequest): Observable<MembreResponse> {
    return this.http.post<MembreResponse>(apiUrl('/membres'), payload);
  }

  update(id: number, payload: MembreRequest): Observable<MembreResponse> {
    return this.http.put<MembreResponse>(apiUrl(`/membres/${id}`), payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/membres/${id}`));
  }
}

