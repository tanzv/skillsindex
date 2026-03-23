import { useCallback, useEffect, useRef, useState } from "react";

export type DeferredLoadStatus = "idle" | "loading" | "ready" | "error";

export function useDeferredLoadStatus(initialStatus: DeferredLoadStatus) {
  const [status, setStatusState] = useState(initialStatus);
  const statusRef = useRef(status);

  const setStatus = useCallback((nextStatus: DeferredLoadStatus) => {
    statusRef.current = nextStatus;
    setStatusState(nextStatus);
  }, []);

  return {
    status,
    statusRef,
    setStatus
  };
}

export function useLatestRef<T>(value: T) {
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}

export function useMountedRef() {
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  return mountedRef;
}
