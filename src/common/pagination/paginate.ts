import { Model } from 'mongoose';
import { Request } from 'express';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginateConfig, Paginated, PaginatedLinks, SortOrder } from './pagination.types';
import { sanitizeSearchQuery } from '../../utils/convert';

/**
 * Parses sort syntax like "createdAt:desc", "title:asc", "-createdAt", "createdAt"
 */
export function parseSort(
  sortBy?: string,
  defaultSortBy: [string, SortOrder] = ['createdAt', 'DESC'],
): { sortMongoose: Record<string, 1 | -1>; sortByMeta: [string, SortOrder][] } {
  if (!sortBy || typeof sortBy !== 'string') {
    const [field, order] = defaultSortBy;
    return {
      sortMongoose: { [field]: order === 'DESC' ? -1 : 1 },
      sortByMeta: [[field, order]],
    };
  }

  const trimmed = sortBy.trim();
  let field = trimmed;
  let order: SortOrder = 'ASC';

  if (trimmed.includes(':')) {
    const [f, d] = trimmed.split(':');
    field = f.trim();
    order = d.trim().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  } else if (trimmed.startsWith('-')) {
    field = trimmed.substring(1).trim();
    order = 'DESC';
  } else if (trimmed.startsWith('+')) {
    field = trimmed.substring(1).trim();
    order = 'ASC';
  }

  return {
    sortMongoose: { [field]: order === 'DESC' ? -1 : 1 },
    sortByMeta: [[field, order]],
  };
}

/**
 * Builds links object matching nestjs-paginate (current, next, last, previous, first)
 */
function buildLinks(
  req: Request | undefined,
  collectionName: string,
  page: number,
  limit: number,
  totalPages: number,
  query: PaginationQueryDto,
): PaginatedLinks {
  const protocol = req?.protocol || 'http';
  const host = (req?.get ? req.get('host') : req?.headers?.['host']) || 'localhost:3000';
  const rawUrl = req?.originalUrl || req?.url || `/api/v1/${collectionName}`;
  const [pathname] = rawUrl.split('?');
  const baseUrl = pathname.startsWith('http') ? pathname : `${protocol}://${host}${pathname}`;

  // Gather current query params
  const baseQuery: Record<string, any> = {
    ...(req?.query || {}),
    limit,
  };
  if (query.sortBy) baseQuery.sortBy = query.sortBy;
  if (query.search) baseQuery.search = query.search;

  const createUrl = (targetPage: number): string => {
    const params = new URLSearchParams();
    params.set('page', String(targetPage));
    for (const [key, value] of Object.entries(baseQuery)) {
      if (key !== 'page' && value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }
    return `${baseUrl}?${params.toString()}`;
  };

  const links: PaginatedLinks = {
    current: createUrl(page),
  };

  if (page < totalPages) {
    links.next = createUrl(page + 1);
  }

  if (totalPages > 0) {
    links.last = createUrl(totalPages);
  }

  if (page > 1) {
    links.previous = createUrl(page - 1);
    links.first = createUrl(1);
  }

  return links;
}

/**
 * Universal pagination helper for Mongoose models matching nestjs-paginate behavior and structure.
 */
export async function paginate<T>(
  model: Model<any>,
  query: PaginationQueryDto,
  config: PaginateConfig<T> = {},
  req?: Request,
): Promise<Paginated<T>> {
  const defaultLimit = config.defaultLimit || 10;
  const maxLimit = config.maxLimit || 100;

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  // 1. Parsing Sort
  const { sortMongoose, sortByMeta } = parseSort(query.sortBy, config.defaultSortBy);

  // 2. Building Filter (combining custom filter + search)
  const filter: Record<string, any> = { ...(config.filter || {}) };

  if (query.search && config.searchableFields && config.searchableFields.length > 0) {
    const cleanSearch = sanitizeSearchQuery(query.search);
    const searchRegex = { $regex: cleanSearch, $options: 'i' };
    const searchConditions = config.searchableFields.map((field) => ({
      [String(field)]: searchRegex,
    }));

    if (filter.$and) {
      filter.$and.push({ $or: searchConditions });
    } else if (Object.keys(filter).length > 0) {
      filter.$and = [{ ...filter }, { $or: searchConditions }];
      for (const key of Object.keys(filter)) {
        if (key !== '$and') delete filter[key];
      }
    } else {
      filter.$or = searchConditions;
    }
  }

  // 3. Concurrent Database Query
  const [data, totalItems] = await Promise.all([
    model.find(filter).sort(sortMongoose).skip(skip).limit(limit).exec(),
    model.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  // 4. Build Links
  const links = buildLinks(req, model.collection.name, page, limit, totalPages, query);

  return {
    data,
    meta: {
      itemsPerPage: limit,
      totalItems,
      currentPage: page,
      totalPages,
      sortBy: sortByMeta,
      ...(query.search ? { search: query.search } : {}),
    },
    links,
  };
}
