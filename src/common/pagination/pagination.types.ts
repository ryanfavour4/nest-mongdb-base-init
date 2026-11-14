export type SortOrder = 'ASC' | 'DESC';

export interface PaginatedMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy: [string, SortOrder][];
  search?: string;
}

export interface PaginatedLinks {
  first?: string;
  previous?: string;
  current: string;
  next?: string;
  last?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
  links: PaginatedLinks;
}

export interface PaginateConfig<T = any> {
  sortableFields?: (keyof T | string)[];
  searchableFields?: (keyof T | string)[];
  defaultSortBy?: [string, SortOrder];
  defaultLimit?: number;
  maxLimit?: number;
  filter?: Record<string, any>;
}
