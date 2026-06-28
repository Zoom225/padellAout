import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthApiService } from '../api/auth-api.service';
import { LoginRequest, MembreResponse } from '../../shared/models/membre.model';
import { Observable, tap } from 'rxjs';
import { AdminSessionService } from './admin-session.service';

export const MEMBER_SESSION_KEY = 'padel_member_session';

interface MemberSessionState {
  member: MembreResponse;
  token: string | null;
}

@Injectable({ providedIn: 'root' })
export class MemberSessionService {
  private readonly sessionState = signal<MemberSessionState | null>(this.loadFromStorage());
  private readonly authApi = inject(AuthApiService);
  private readonly adminSession = inject(AdminSessionService);

  readonly member = computed(() => this.sessionState()?.member ?? null);
  readonly memberId = computed(() => this.sessionState()?.member.id ?? null);
  readonly matricule = computed(() => this.sessionState()?.member.matricule ?? null);
  readonly token = computed(() => this.sessionState()?.token ?? null);
  readonly isAuthenticated = computed(() => !!this.sessionState()?.member.id);

  setMember(member: MembreResponse, token?: string): void {
    const state: MemberSessionState = { member, token: token ?? member.token ?? null };
    this.sessionState.set(state);
    localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(state));
  }

  clearMember(): void {
    this.sessionState.set(null);
    localStorage.removeItem(MEMBER_SESSION_KEY);
  }

  /**
   * Authentifie un membre et stocke le token + membre en session
   */
  login(matricule: string): Observable<MembreResponse> {
    const payload: LoginRequest = { matricule };
    return this.authApi.loginMembre(payload).pipe(
      tap((response: MembreResponse) => {
        this.adminSession.clearSession();
        this.setMember(response, response.token);
      }),
    );
  }

  private loadFromStorage(): MemberSessionState | null {
    const raw = localStorage.getItem(MEMBER_SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      // Migration of old local storage data
      if (parsed && 'id' in parsed) {
        return { member: parsed as MembreResponse, token: parsed.token ?? null };
      }
      return parsed as MemberSessionState;
    } catch {
      localStorage.removeItem(MEMBER_SESSION_KEY);
      return null;
    }
  }
}
