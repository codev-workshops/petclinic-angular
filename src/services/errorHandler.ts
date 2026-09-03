import axios from 'axios';

/**
 * Port of src/app/error.service.ts (HttpErrorHandler).
 *
 * The Angular handler builds a message from the HTTP failure, overrides it with
 * the first Spring MVC FieldError found in the `errors` response header, logs
 * it and re-throws the message. Callers get the message via the error callback
 * of `subscribe`. Here the equivalent is an `ApiError` rejection.
 */

export const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';
export const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Please check your connection and try again.';

interface SpringFieldError {
  errorMessage?: string;
  [key: string]: unknown;
}

export class ApiError<TFallback = unknown> extends Error {
  readonly serviceName: string;
  readonly operation: string;
  readonly status: number | undefined;
  /** Default value the Angular service declared for this operation (e.g. `[]`, `{}`, `0`). */
  readonly fallback: TFallback;
  readonly cause: unknown;

  constructor(
    message: string,
    options: {
      serviceName: string;
      operation: string;
      status: number | undefined;
      fallback: TFallback;
      cause: unknown;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.serviceName = options.serviceName;
    this.operation = options.operation;
    this.status = options.status;
    this.fallback = options.fallback;
    this.cause = options.cause;
  }
}

/** Parses the Spring `errors` header and returns the first `errorMessage`, if any. */
export function parseErrorsHeader(header: unknown): string | undefined {
  if (typeof header !== 'string' || header.length === 0) {
    return undefined;
  }
  try {
    const errors: unknown = JSON.parse(header);
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0] as SpringFieldError;
      if (first && typeof first.errorMessage === 'string' && first.errorMessage) {
        return first.errorMessage;
      }
    }
  } catch {
    // malformed header: fall through to the generic message
  }
  return undefined;
}

function headerValue(headers: unknown, name: string): unknown {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }
  const record = headers as Record<string, unknown>;
  return record[name] ?? record[name.toLowerCase()] ?? record[name.toUpperCase()];
}

function bodyToString(body: unknown): string {
  if (body === undefined || body === null) {
    return '';
  }
  if (typeof body === 'string') {
    return body;
  }
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}

/** Returns the HTTP status of an error, if it was an HTTP failure. */
export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.status;
  }
  if (error instanceof ApiError) {
    return error.status;
  }
  return undefined;
}

/**
 * Builds the user-facing message for any failure, mirroring HttpErrorHandler:
 *  1. Spring `errors` header -> `errors[0].errorMessage`
 *  2. HTTP failure -> `server returned code <status> with body "<body>"`
 *  3. Network failure (no response) -> network message
 *  4. Anything else -> generic message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const fromHeader = parseErrorsHeader(headerValue(error.response.headers, 'errors'));
      if (fromHeader) {
        return fromHeader;
      }
      return `server returned code ${error.response.status} with body "${bodyToString(error.response.data)}"`;
    }
    return NETWORK_ERROR_MESSAGE;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return GENERIC_ERROR_MESSAGE;
}

/**
 * Curried factory matching `HttpErrorHandler.createHandleError(serviceName)(operation, result)`.
 * The returned function logs and throws an `ApiError` carrying the message and
 * the Angular default (`fallback`) for the operation.
 */
export function createHandleError(serviceName: string) {
  return function handleError<TFallback>(operation: string, fallback: TFallback) {
    return (error: unknown): never => {
      const message = getErrorMessage(error);
      console.error(error);
      console.error(`${serviceName}::${operation} failed: ${message}`);
      throw new ApiError(message, {
        serviceName,
        operation,
        status: getErrorStatus(error),
        fallback,
        cause: error,
      });
    };
  };
}
