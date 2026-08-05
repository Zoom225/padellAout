import { Injectable, computed, signal } from '@angular/core';
import { LoginResponse as AdminLoginResponse } from '../../shared/models/auth.model';
import { MembreResponse } from '../../shared/models/membre.model';
import { clearStoredValue, readStoredValue, writeStoredValue } from './session-storage.util';

const AUTH_SESSION_KEY = 'padel_auth_session';
const LEGACY_ADMIN_SESSION_KEY = 'padel_admin_session';
const LEGACY_MEMBER_SESSION_KEY = 'padel_member_session';

interface MemberSessionState {
  member: MembreResponse;
  token: string | null;
}

interface AuthSessionState {
  admin: AdminLoginResponse | null;
  member: MemberSessionState | null;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly sessionState = signal<AuthSessionState | null>(this.loadFromStorage());

  readonly adminSession = computed(() => this.sessionState()?.admin ?? null);
  readonly adminToken = computed(() => this.sessionState()?.admin?.token ?? null);
  readonly adminRole = computed(() => this.sessionState()?.admin?.role ?? null);
  readonly adminSiteId = computed(() => this.sessionState()?.admin?.siteId ?? null);
  readonly memberSession = computed(() => this.sessionState()?.member?.member ?? null);
  readonly memberToken = computed(() => this.sessionState()?.member?.token ?? null);
  readonly memberId = computed(() => this.sessionState()?.member?.member.id ?? null);
  readonly memberMatricule = computed(() => this.sessionState()?.member?.member.matricule ?? null);
  readonly hasAdminSession = computed(() => !!this.adminToken());
  readonly hasMemberSession = computed(() => !!this.memberId());

  setAdminSession(session: AdminLoginResponse): void {
    this.persist({ ...this.currentState(), admin: session });
  }

  clearAdminSession(): void {
    this.persist({ ...this.currentState(), admin: null });
  }

  setMemberSession(member: MembreResponse, token?: string): void {
    this.persist({
      ...this.currentState(),
      member: { member, token: token ?? member.token ?? null }
    });
  }

  clearMemberSession(): void {
    this.persist({ ...this.currentState(), member: null });
  }

  clearAll(): void {
    this.persist({ admin: null, member: null });
  }

  private currentState(): AuthSessionState {
    return this.sessionState() ?? { admin: null, member: null };
  }

  private persist(nextState: AuthSessionState): void {
    const normalizedState: AuthSessionState = {
      admin: nextState.admin,
      member: nextState.member
    };

    if (!normalizedState.admin && !normalizedState.member) {
      this.sessionState.set(null);
      clearStoredValue(AUTH_SESSION_KEY);
      clearStoredValue(LEGACY_ADMIN_SESSION_KEY);
      clearStoredValue(LEGACY_MEMBER_SESSION_KEY);
      return;
    }

    this.sessionState.set(normalizedState);
    writeStoredValue(AUTH_SESSION_KEY, normalizedState);

    if (normalizedState.admin) {
      writeStoredValue(LEGACY_ADMIN_SESSION_KEY, normalizedState.admin);
    } else {
      clearStoredValue(LEGACY_ADMIN_SESSION_KEY);
    }

    if (normalizedState.member) {
      writeStoredValue(LEGACY_MEMBER_SESSION_KEY, normalizedState.member);
    } else {
      clearStoredValue(LEGACY_MEMBER_SESSION_KEY);
    }
  }

  private loadFromStorage(): AuthSessionState | null {
    const combined = readStoredValue<AuthSessionState>(AUTH_SESSION_KEY);
    if (combined && (combined.admin || combined.member)) {
      return {
        admin: combined.admin ?? null,
        member: this.normalizeMemberSession(combined.member)
      };
    }

    const admin = readStoredValue<AdminLoginResponse>(LEGACY_ADMIN_SESSION_KEY);
    const member = this.readLegacyMemberSession();

    if (!admin && !member) {
      return null;
    }

    return {
      admin,
      member
    };
  }

  private readLegacyMemberSession(): MemberSessionState | null {
    const parsed = readStoredValue<MemberSessionState | MembreResponse>(LEGACY_MEMBER_SESSION_KEY);
    return this.normalizeMemberSession(parsed);
  }

  private normalizeMemberSession(value: MemberSessionState | MembreResponse | null): MemberSessionState | null {
    if (!value) {
      return null;
    }

    if ('member' in value) {
      return {
        member: value.member,
        token: value.token ?? value.member.token ?? null
      };
    }

    return {
      member: value,
      token: value.token ?? null
    };
  }
}
