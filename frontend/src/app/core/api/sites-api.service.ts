import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SiteRequest, SiteResponse } from '../../shared/models/site-terrain.model';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class SitesApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<SiteResponse[]> {
    return this.http.get<SiteResponse[]>(apiUrl('/sites'));
  }

  getById(id: number): Observable<SiteResponse> {
    return this.http.get<SiteResponse>(apiUrl(`/sites/${id}`));
  }

  create(payload: SiteRequest): Observable<SiteResponse> {
    return this.http.post<SiteResponse>(apiUrl('/sites'), payload);
  }

  update(id: number, payload: SiteRequest): Observable<SiteResponse> {
    return this.http.put<SiteResponse>(apiUrl(`/sites/${id}`), payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/sites/${id}`));
  }
}

