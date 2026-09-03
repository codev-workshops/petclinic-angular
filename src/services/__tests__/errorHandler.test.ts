import { describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import {
  ApiError,
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  createHandleError,
  getErrorMessage,
  parseErrorsHeader,
} from '../errorHandler';
import { makeErrorsHeader } from '../../mocks/data';

function axiosFailure(status: number, data: unknown, headers: Record<string, string> = {}): AxiosError {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
    status,
    statusText: 'Error',
    data,
    headers,
    config,
  });
}

describe('parseErrorsHeader', () => {
  it('returns errors[0].errorMessage', () => {
    expect(parseErrorsHeader(makeErrorsHeader('must not be empty'))).toBe('must not be empty');
  });

  it('ignores missing, empty, malformed or non-array headers', () => {
    expect(parseErrorsHeader(undefined)).toBeUndefined();
    expect(parseErrorsHeader('')).toBeUndefined();
    expect(parseErrorsHeader('{not json')).toBeUndefined();
    expect(parseErrorsHeader('{"errorMessage":"x"}')).toBeUndefined();
    expect(parseErrorsHeader('[]')).toBeUndefined();
  });
});

describe('getErrorMessage', () => {
  it('prefers the Spring errors header over the HTTP status', () => {
    const error = axiosFailure(400, 'Bad Request', { errors: makeErrorsHeader('size must be between 1 and 30') });
    expect(getErrorMessage(error)).toBe('size must be between 1 and 30');
  });

  it('formats HTTP failures like HttpErrorHandler', () => {
    expect(getErrorMessage(axiosFailure(404, 'Not Found'))).toBe('server returned code 404 with body "Not Found"');
    expect(getErrorMessage(axiosFailure(500, { message: 'boom' }))).toBe(
      'server returned code 500 with body "{"message":"boom"}"',
    );
  });

  it('uses the network message when there is no response', () => {
    expect(getErrorMessage(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('falls back to a generic message for unknown values', () => {
    expect(getErrorMessage(undefined)).toBe(GENERIC_ERROR_MESSAGE);
    expect(getErrorMessage(new Error('custom'))).toBe('custom');
  });
});

describe('createHandleError', () => {
  it('logs and throws an ApiError with the operation default', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const handle = createHandleError('OwnerService')('getOwners', []);
    let thrown: unknown;
    try {
      handle(axiosFailure(500, 'kaboom'));
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(ApiError);
    const apiError = thrown as ApiError;
    expect(apiError.serviceName).toBe('OwnerService');
    expect(apiError.operation).toBe('getOwners');
    expect(apiError.status).toBe(500);
    expect(apiError.fallback).toEqual([]);
    expect(apiError.message).toBe('server returned code 500 with body "kaboom"');
    expect(consoleError).toHaveBeenCalledWith('OwnerService::getOwners failed: server returned code 500 with body "kaboom"');
  });
});
