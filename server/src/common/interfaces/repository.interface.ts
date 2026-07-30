export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, unknown>): Promise<T | null>;
  findMany(params?: {
    skip?: number;
    take?: number;
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    include?: Record<string, unknown>;
  }): Promise<T[]>;
  create(data: Record<string, unknown>): Promise<T>;
  update(id: string, data: Record<string, unknown>): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: Record<string, unknown>): Promise<number>;
}
