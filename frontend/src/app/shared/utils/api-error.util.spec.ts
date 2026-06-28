import { describe, expect, it } from 'vitest';
import { extractApiErrorMessage } from './api-error.util';

describe('extractApiErrorMessage', () => {
  // ── Cas nominaux ──────────────────────────────────────────────────────────

  it('should return the first field validation message when present', () => {
    const message = extractApiErrorMessage({
      error: {
        errors: {
          email: 'Email invalide',
          password: 'Mot de passe requis'
        }
      }
    });

    expect(message).toBe('Email invalide');
  });

  it('should return the backend message when no field errors are present', () => {
    const message = extractApiErrorMessage({
      error: {
        message: 'Reservation impossible'
      }
    });

    expect(message).toBe('Reservation impossible');
  });

  it('should fall back to the provided fallback message', () => {
    const message = extractApiErrorMessage(undefined, 'Erreur par defaut');

    expect(message).toBe('Erreur par defaut');
  });

  // ── Fallback par défaut ───────────────────────────────────────────────────

  it('should return the default fallback when no argument is provided', () => {
    const message = extractApiErrorMessage(undefined);

    expect(message).toBe('Une erreur est survenue.');
  });

  it('should return the default fallback when error object is null', () => {
    const message = extractApiErrorMessage(null);

    expect(message).toBe('Une erreur est survenue.');
  });

  it('should return the default fallback when error object is empty', () => {
    const message = extractApiErrorMessage({});

    expect(message).toBe('Une erreur est survenue.');
  });

  // ── Champs de validation ──────────────────────────────────────────────────

  it('should return the only field message when errors has a single entry', () => {
    const message = extractApiErrorMessage({
      error: {
        errors: { phone: 'Numéro de téléphone invalide' }
      }
    });

    expect(message).toBe('Numéro de téléphone invalide');
  });

  it('should ignore errors object when it is empty and use backend message instead', () => {
    const message = extractApiErrorMessage({
      error: {
        errors: {},
        message: 'Créneau déjà réservé'
      }
    });

    expect(message).toBe('Créneau déjà réservé');
  });

  // ── Message de niveau racine ──────────────────────────────────────────────

  it('should use root-level message when error.message is absent', () => {
    const message = extractApiErrorMessage({
      message: 'Timeout réseau'
    });

    expect(message).toBe('Timeout réseau');
  });

  // ── Priorité des sources ──────────────────────────────────────────────────

  it('should prioritise field errors over backend message', () => {
    const message = extractApiErrorMessage({
      error: {
        errors: { name: 'Nom requis' },
        message: 'Validation échouée'
      }
    });

    expect(message).toBe('Nom requis');
  });

  it('should prioritise backend message over root-level message', () => {
    const message = extractApiErrorMessage({
      message: 'Erreur HTTP générique',
      error: {
        message: 'Membre introuvable'
      }
    });

    expect(message).toBe('Membre introuvable');
  });

  // ── Scénarios métier réels ────────────────────────────────────────────────

  it('should handle a 400 Bad Request with multiple field errors (inscription)', () => {
    const message = extractApiErrorMessage({
      error: {
        status: 400,
        errors: {
          email: 'Email déjà utilisé',
          password: 'Minimum 8 caractères'
        }
      }
    });

    // Seul le premier message doit être retourné
    expect(message).toBe('Email déjà utilisé');
  });

  it('should handle a 409 Conflict from reservation overlap', () => {
    const message = extractApiErrorMessage({
      error: {
        status: 409,
        message: 'Ce terrain est déjà réservé sur ce créneau.'
      }
    });

    expect(message).toBe('Ce terrain est déjà réservé sur ce créneau.');
  });

  it('should handle a 403 Forbidden with a custom fallback', () => {
    const message = extractApiErrorMessage(
      { error: { status: 403 } },
      'Accès refusé, veuillez contacter un administrateur.'
    );

    expect(message).toBe('Accès refusé, veuillez contacter un administrateur.');
  });

  it('should ignore a generic HTTP status label when no business message exists', () => {
    const message = extractApiErrorMessage(
      { error: { status: 400, error: 'Bad Request' } },
      'Action impossible.'
    );

    expect(message).toBe('Action impossible.');
  });

  it('should handle a payment failure message from the backend', () => {
    const message = extractApiErrorMessage({
      error: {
        message: 'Paiement refusé : solde insuffisant.'
      }
    });

    expect(message).toBe('Paiement refusé : solde insuffisant.');
  });
});
