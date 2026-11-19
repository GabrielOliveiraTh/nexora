export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
};

export type Nullable<T> = T | null;

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SortParams {
  field: string;
  order: 'ascend' | 'descend';
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: unknown;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: SortParams;
  filters?: FilterParams[];
  search?: string;
}
