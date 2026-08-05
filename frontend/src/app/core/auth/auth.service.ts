import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthApiService } from '../api/auth-api.service';
import { LoginRequest as AdminLoginRequest, LoginResponse as AdminLoginResponse } from '../../shared/models/auth.model';
import { LoginRequest as MemberLoginRequest, LoginResponse as MemberLoginResponse } from '../../shared/models/membre.model';
import { AuthSessionService } from './auth-session.service';
import { AdminSessionService } from './admin-session.service';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly authApi: AuthApiService,
    private readonly authSession: AuthSessionService,
    private readonly adminSession: AdminSessionService,
    private readonly memberSession: MemberSessionService
  ) {}

  loginAdmin(payload: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.authApi.loginAdmin(payload).pipe(
      tap((response) => {
        this.memberSession.clearMember();
        this.adminSession.setSession(response);
      })
    );
  }

  loginMember(payload: MemberLoginRequest): Observable<MemberLoginResponse> {
    return this.authApi.loginMembre(payload).pipe(
      tap((response) => {
        this.adminSession.clearSession();
        this.memberSession.setMember(response, response.token);
      })
    );
  }

  logout(): void {
    this.authSession.clearAll();
  }
}
