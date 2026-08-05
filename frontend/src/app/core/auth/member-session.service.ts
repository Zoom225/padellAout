import { Injectable, computed, inject } from '@angular/core';
import { MembreResponse } from '../../shared/models/membre.model';
import { AuthSessionService } from './auth-session.service';

export const MEMBER_SESSION_KEY = 'padel_member_session';

@Injectable({ providedIn: 'root' })
export class MemberSessionService {
  private readonly authSession = inject(AuthSessionService);

  readonly member = computed(() => this.authSession.memberSession());
  readonly memberId = computed(() => this.authSession.memberId());
  readonly matricule = computed(() => this.authSession.memberMatricule());
  readonly token = computed(() => this.authSession.memberToken());
  readonly isAuthenticated = computed(() => this.authSession.hasMemberSession());

  setMember(member: MembreResponse, token?: string): void {
    this.authSession.setMemberSession(member, token);
  }

  clearMember(): void {
    this.authSession.clearMemberSession();
  }
}
