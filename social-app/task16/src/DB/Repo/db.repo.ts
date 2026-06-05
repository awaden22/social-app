import type {
  CreateOptions,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
} from "mongoose";

abstract class DBRepo<T> {
  constructor(protected Model: Model<T>) {}
  public async create({
    data,
    options,
  }: {
    data: any;
    options?: CreateOptions;
  }) {
    return await this.Model.create(data, options);
  }

  public findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.Model.findOne(filter, projection, options);
  }
  public findById({
    id,
    projection,
    options,
  }: {
    id: string | Types.ObjectId;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.Model.findById(id, projection, options);
  }
}
export default DBRepo;
