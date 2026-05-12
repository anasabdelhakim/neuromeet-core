export class APIFeatures {
  private prismaQuery: any = {};

  constructor(private queryString: any) {}


  // ✅ FILTER
  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];

    excludedFields.forEach((el) => delete queryObj[el]);

    const where: any = {};

    Object.keys(queryObj).forEach((key) => {
      const value = queryObj[key];

      // gte, gt, lte, lt
      if (typeof value === 'object') {
        where[key] = {};
        Object.keys(value).forEach((op) => {
          if (['gte', 'gt', 'lte', 'lt'].includes(op)) {
            where[key][op] = value[op];
          }
        });
      } else {
        where[key] = value;
      }
    });

    this.prismaQuery.where = where;
    return this;
  }

  // ✅ SORT
  sort(): this {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(',');

      this.prismaQuery.orderBy = sortFields.map((field: string) => {
        if (field.startsWith('-')) {
          return { [field.substring(1)]: 'desc' };
        }
        return { [field]: 'asc' };
      });
    } else {
      this.prismaQuery.orderBy = { created_at: 'desc' };
    }

    return this;
  }

  // ✅ SELECT FIELDS
  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');

      const select: any = {};
      fields.forEach((field: string) => {
        select[field] = true;
      });

      this.prismaQuery.select = select;
    } else {
      // exclude __v مش موجود في prisma غالباً
      this.prismaQuery.select = undefined;
    }

    return this;
  }

  // ✅ PAGINATION
  paginate(): this {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.prismaQuery.skip = skip;
    this.prismaQuery.take = limit;

    return this;
  }

  // ✅ SEARCH (بحث نصي في حقول معينة)
  search(): this {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword;

      this.prismaQuery.where = {
        ...this.prismaQuery.where,
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      };
    }

    return this;
  }

  // ✅ GET FINAL QUERY
  getQuery() {
    return this.prismaQuery;
  }
}