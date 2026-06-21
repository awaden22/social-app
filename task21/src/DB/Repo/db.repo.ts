import type {
  CreateOptions,
  HydratedDocument,
  HydrateOptions,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
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
  public find({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.Model.find(filter, projection, options);
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
  public async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: any;
  }) {
    return this.Model.updateOne(filter, update, options);
  }

  getDBDoc(data: T) {
    return new this.Model(data);
  }
  async saveDBDoc(doc: HydratedDocument<T>) {
    return await doc.save();
  }
  async paginate({
    filter,
    projection,
    options,
    size = 3,
    page = 1,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
    size?: number;
    page?: number;
  }) {
    const skip = (page - 1) * size;
    const docs = await this.Model.find(filter, projection, options)
      .skip(skip)
      .limit(size);
    const totalDocs = await this.Model.countDocuments(filter);
    return {
      docs,
      page,
      totalDocs,
      totalPages: Math.ceil(totalDocs / size),
    };
  }
  public findandUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options: QueryOptions<T>;
  }) {
    return this.Model.findOneAndUpdate(filter, update, options);
  }
}

export default DBRepo;
