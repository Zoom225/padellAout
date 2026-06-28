import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthApiService } from '../api/auth-api.service';
import { LoginRequest, LoginResponse } from '../../shared/models/auth.model';
import { AdminSessionService } from './admin-session.service';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly authApi: AuthApiService,
    private readonly adminSession: AdminSessionService,
    private readonly memberSession: MemberSessionService
  ) {}

  loginAdmin(payload: LoginRequest): Observable<LoginResponse> {
    return this.authApi.loginAdmin(payload).pipe(
      tap((response) => {
        this.memberSession.clearMember();
        this.adminSession.setSession(response);
      })
    );
  }

  logout(): void {
    this.adminSession.clearSession();
  }
}
