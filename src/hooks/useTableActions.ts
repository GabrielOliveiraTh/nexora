import { useCallback } from 'react';
import { useAppDispatch } from '@hooks/useAppStore';

interface TableActions<TCreate, TUpdate> {
  onCreate: (data: TCreate) => Promise<void>;
  onUpdate: (id: string, data: TUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useTableActions<TCreate, TUpdate>(config: {
  createAction: (data: TCreate) => unknown;
  updateAction: (params: { id: string; payload: TUpdate }) => unknown;
  deleteAction: (id: string) => unknown;
  fetchAction: (params?: unknown) => unknown;
  fetchParams?: unknown;
}): TableActions<TCreate, TUpdate> {
  const dispatch = useAppDispatch();

  const onCreate = useCallback(
    async (data: TCreate) => {
      await dispatch(config.createAction(data) as never);
    },
    [dispatch, config.createAction],
  );

  const onUpdate = useCallback(
    async (id: string, data: TUpdate) => {
      await dispatch(config.updateAction({ id, payload: data }) as never);
    },
    [dispatch, config.updateAction],
  );

  const onDelete = useCallback(
    async (id: string) => {
      await dispatch(config.deleteAction(id) as never);
    },
    [dispatch, config.deleteAction],
  );

  const onBulkDelete = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => dispatch(config.deleteAction(id) as never)));
    },
    [dispatch, config.deleteAction],
  );

  const onRefresh = useCallback(async () => {
    await dispatch(config.fetchAction(config.fetchParams) as never);
  }, [dispatch, config.fetchAction, config.fetchParams]);

  return { onCreate, onUpdate, onDelete, onBulkDelete, onRefresh };
}
