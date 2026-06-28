export interface ApiErrorResponse {
  status?: number;
  message?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

const isTechnicalHttpMessage = (message: string): boolean => {
  const normalized = message.trim().toLowerCase();
  return normalized === 'bad request'
    || normalized === 'forbidden'
    || normalized === 'unauthorized'
    || normalized === 'not found'
    || normalized === 'internal server error'
    || normalized.startsWith('http failure response');
};

const toUserMessage = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  const message = String(value);
  return isTechnicalHttpMessage(message) ? null : message;
};

export const extractApiErrorMessage = (error: unknown, fallback = 'Une erreur est survenue.'): string => {
  if (!error) {
    return fallback;
  }

  const candidate = error as any;

  if (candidate?.error?.errors && typeof candidate.error.errors === 'object') {
    const firstFieldMessage = Object.values(candidate.error.errors)[0];
    const message = toUserMessage(firstFieldMessage);
    if (message) {
      return message;
    }
  }

  const backendMessage = toUserMessage(candidate?.error?.message);
  if (backendMessage) {
    return backendMessage;
  }

  const rootMessage = toUserMessage(candidate?.message);
  if (rootMessage) {
    return rootMessage;
  }

  const stringError = typeof candidate?.error === 'string' ? toUserMessage(candidate.error) : null;
  if (stringError) {
    return stringError;
  }

  if (candidate?.error && typeof candidate.error === 'object') {
    const errorObj = candidate.error as Record<string, unknown>;
    for (const key of ['message', 'msg', 'detail', 'description', 'reason', 'error']) {
      const message = toUserMessage(errorObj[key]);
      if (message) {
        return message;
      }
    }
  }

  return fallback;
};
