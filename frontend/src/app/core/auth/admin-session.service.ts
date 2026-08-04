import { Injectable, computed, inject } from '@angular/core';
import { LoginResponse } from '../../shared/models/auth.model';
import { TypeAdministrateur } from '../../shared/models/enums.model';
import { AuthSessionService } from './auth-session.service';

export const ADMIN_SESSION_KEY = 'padel_admin_session';

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private readonly authSession = inject(AuthSessionService);

  readonly session = computed(() => this.authSession.adminSession());
  readonly token = computed(() => this.authSession.adminToken());
  readonly role = computed<TypeAdministrateur | null>(() => this.authSession.adminRole() as TypeAdministrateur | null);
  readonly siteId = computed(() => this.authSession.adminSiteId());
  readonly isAuthenticated = computed(() => this.authSession.hasAdminSession());
  readonly isGlobalAdmin = computed(() => this.role() === 'GLOBAL');
  readonly isSiteAdmin = computed(() => this.role() === 'SITE');

  setSession(session: LoginResponse): void {
    this.authSession.setAdminSession(session);
  }

  clearSession(): void {
    this.authSession.clearAdminSession();
  }
}
