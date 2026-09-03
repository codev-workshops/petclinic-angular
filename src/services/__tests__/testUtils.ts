import { vi } from 'vitest';
import { ApiError } from '../errorHandler';

/** Silences the console.error calls made by createHandleError during expected failures. */
export function silenceConsoleError() {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
}

/** Awaits a rejected API promise and returns the ApiError it carries. */
export async function expectApiError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) {
      return error;
    }
    throw new Error(`Expected ApiError, got ${String(error)}`);
  }
  throw new Error('Expected promise to reject');
}
