export type PaginationQueryDto = {
  page?: number;
  limit?: number;
  id?: number;
  search?: string;
};

export interface PaginationResult<T> {
  page?: number;
  limit?: number;
  total: number;
  data: T[];
}
