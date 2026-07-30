import { IBaseRepository } from '../interfaces/repository.interface';

export abstract class BaseAbstractRepository<T> implements IBaseRepository<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected constructor(protected readonly modelDelegate: any) {}

  async findById(id: string): Promise<T | null> {
    return this.modelDelegate.findUnique({
      where: { id },
    });
  }

  async findOne(filter: Record<string, unknown>): Promise<T | null> {
    return this.modelDelegate.findFirst({
      where: filter,
    });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    include?: Record<string, unknown>;
  }): Promise<T[]> {
    const { skip, take, where, orderBy, include } = params || {};
    return this.modelDelegate.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  async create(data: Record<string, unknown>): Promise<T> {
    return this.modelDelegate.create({
      data,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<T> {
    return this.modelDelegate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.modelDelegate.delete({
      where: { id },
    });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.modelDelegate.count({
      where,
    });
  }
}
