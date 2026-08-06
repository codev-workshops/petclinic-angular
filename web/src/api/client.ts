import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const defaultBaseUrl = "http://localhost:9966/petclinic/api/";
const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
});

declare module "axios" {
  interface AxiosRequestConfig {
    serviceName?: string;
    operation?: string;
  }
}

client.interceptors.response.use(undefined, (error: AxiosError) => {
  const response = error.response;
  const config = error.config;
  const serviceName = config?.serviceName || "Service";
  const operation = config?.operation || "request";
  let message = error.message;

  if (response) {
    const errorsHeader = response.headers?.errors;
    let headerMessage: string | undefined;
    if (errorsHeader) {
      try {
        const parsed = JSON.parse(String(errorsHeader));
        if (Array.isArray(parsed) && parsed[0]?.errorMessage)
          headerMessage = parsed[0].errorMessage;
      } catch {
        headerMessage = undefined;
      }
    }
    const body =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
    message =
      headerMessage ||
      `server returned code ${response.status} with body "${body}"`;
  }

  console.error(error);
  console.error(`${serviceName}::${operation} failed: ${message}`);
  return Promise.reject(message);
});

export async function request<T>(
  config: AxiosRequestConfig,
  serviceName: string,
  operation: string,
): Promise<T> {
  return client
    .request<T>({
      ...config,
      serviceName,
      operation,
    })
    .then((response) => response.data as T);
}

export { client as apiClient };
