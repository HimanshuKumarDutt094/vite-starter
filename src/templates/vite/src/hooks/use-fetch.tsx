import { useEffect, useState, useCallback } from "react";

export interface TypeSafeFetchOptions extends Omit<RequestInit, "method"> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: BodyInit | null;
}

export const FETCH_STATUS = ["idle", "loading", "success", "error"] as const;
export type FetchStatus = (typeof FETCH_STATUS)[number];

export interface FetchError {
  code: string;
  message: string;
  // Optionally add more fields (e.g., status, details)
}

interface UseFetchOptions<T> {
  create?: (data: unknown) => T;
  fetchOptions?: TypeSafeFetchOptions;
}

function isFetchError(obj: unknown): obj is FetchError {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "code" in obj &&
    "message" in obj &&
    typeof (obj as { code: unknown }).code === "string" &&
    typeof (obj as { message: unknown }).message === "string"
  );
}

export function useFetch<T = unknown>(
  url: string,
  options?: UseFetchOptions<T>
) {
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<FetchError | null>(null);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setStatus("loading");
      setError(null);
      try {
        const response = await fetch(url, { ...options?.fetchOptions, signal });
        if (!response.ok) {
          const error: FetchError = {
            code: `HTTP_${response.status}`,
            message: `HTTP error! status: ${response.status}`,
          };
          throw error;
        }
        const rawData = await response.json();
        if (options?.create) {
          const result = options.create(rawData);
          setData(result);
        } else {
          setData(rawData as T);
        }
        setStatus("success");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        const error: FetchError = isFetchError(err)
          ? err
          : err instanceof Error
          ? {
              code: "FETCH_ERROR",
              message: err.message,
            }
          : {
              code: "FETCH_ERROR",
              message: String(err),
            };
        setError(error);
        setStatus("error");
      }
    },
    [url, options]
  );

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [url, fetchData]);

  return { status, data, error, refetch } as {
    status: FetchStatus;
    data: T | null;
    error: FetchError | null;
    refetch: () => void;
  };
}
