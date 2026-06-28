import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ReservationRequest,
  ReservationResponse
} from '../../shared/models/reservation.model';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ReservationsApiService {
  constructor(private readonly http: HttpClient) {}

  create(payload: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(apiUrl('/reservations'), payload);
  }

  getById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(apiUrl(`/reservations/${id}`));
  }

  getByMatch(matchId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(apiUrl(`/reservations/match/${matchId}`));
  }

  getByMembre(membreId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(apiUrl(`/reservations/membre/${membreId}`));
  }

  cancel(id: number): Observable<void> {
    return this.http.patch<void>(apiUrl(`/reservations/${id}/cancel`), {});
  }
}

