import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest as AdminLoginRequest, LoginResponse as AdminLoginResponse } from '../../shared/models/auth.model';
import { LoginRequest, MembreResponse } from '../../shared/models/membre.model';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private readonly http: HttpClient) {}

  loginAdmin(payload: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(apiUrl('/auth/login'), payload);
  }

  loginMembre(payload: LoginRequest): Observable<MembreResponse> {
    return this.http.post<MembreResponse>(apiUrl('/membres/login'), payload);
  }
}
