export class LLMError extends Error {
  public readonly code?: string;
  public readonly cause?: unknown;
  constructor(message: string, code?: string, cause?: unknown) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
    this.cause = cause;
  }
}

export class ValidationError extends LLMError {
  constructor(message: string) {
    super(message, 'validation_error');
    this.name = 'ValidationError';
  }
}

export class ProviderError extends LLMError {
  constructor(message: string, cause?: unknown) {
    super(message, 'provider_error', cause);
    this.name = 'ProviderError';
  }
}
