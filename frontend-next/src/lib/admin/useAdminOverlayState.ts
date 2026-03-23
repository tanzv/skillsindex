import { useCallback, useMemo, useState } from "react";

export type AdminOverlayKind = "create" | "detail" | "edit" | "review" | "confirm";

export interface AdminOverlayState<TEntity extends string = string> {
  open: true;
  kind: AdminOverlayKind;
  entity: TEntity;
  entityId: number | string | null;
}

export interface OpenAdminOverlayInput<TEntity extends string = string> {
  kind: AdminOverlayKind;
  entity: TEntity;
  entityId?: number | string | null;
}

export function createAdminOverlayState<TEntity extends string = string>({
  kind,
  entity,
  entityId = null
}: OpenAdminOverlayInput<TEntity>): AdminOverlayState<TEntity> {
  return {
    open: true,
    kind,
    entity,
    entityId
  };
}

export function closeAdminOverlayState(): null {
  return null;
}

export function isAdminOverlayMatch<TEntity extends string = string>(
  state: AdminOverlayState<TEntity> | null,
  match: Partial<Pick<AdminOverlayState<TEntity>, "kind" | "entity" | "entityId">>
): boolean {
  if (!state) {
    return false;
  }

  if (match.kind && state.kind !== match.kind) {
    return false;
  }
  if (match.entity && state.entity !== match.entity) {
    return false;
  }
  if (match.entityId !== undefined && state.entityId !== match.entityId) {
    return false;
  }

  return true;
}

export function useAdminOverlayState<TEntity extends string = string>(initialState: AdminOverlayState<TEntity> | null = null) {
  const [overlay, setOverlay] = useState<AdminOverlayState<TEntity> | null>(initialState);

  const openOverlay = useCallback((input: OpenAdminOverlayInput<TEntity>) => {
    setOverlay(createAdminOverlayState(input));
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlay(closeAdminOverlayState());
  }, []);

  const helpers = useMemo(
    () => ({
      isOpen: Boolean(overlay),
      isMatch: (match: Partial<Pick<AdminOverlayState<TEntity>, "kind" | "entity" | "entityId">>) =>
        isAdminOverlayMatch(overlay, match)
    }),
    [overlay]
  );

  return {
    overlay,
    openOverlay,
    closeOverlay,
    ...helpers
  };
}
