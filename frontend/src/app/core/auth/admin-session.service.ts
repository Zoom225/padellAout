import { Injectable, computed, signal } from '@angular/core';
import { LoginResponse } from '../../shared/models/auth.model';
import { TypeAdministrateur } from '../../shared/models/enums.model';

export const ADMIN_SESSION_KEY = 'padel_admin_session';

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private readonly sessionState = signal<LoginResponse | null>(this.loadFromStorage());

  readonly session = computed(() => this.sessionState());
  readonly token = computed(() => this.sessionState()?.token ?? null);
  readonly role = computed<TypeAdministrateur | null>(() => this.sessionState()?.role ?? null);
  readonly siteId = computed<number | null>(() => this.sessionState()?.siteId ?? null);
  readonly isAuthenticated = computed(() => !!this.token());
  readonly isGlobalAdmin = computed(() => this.role() === 'GLOBAL');
  readonly isSiteAdmin = computed(() => this.role() === 'SITE');

  setSession(session: LoginResponse): void {
    this.sessionState.set(session);
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    this.sessionState.set(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  private loadFromStorage(): LoginResponse | null {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
  }
}
