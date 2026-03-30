export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

/**
 * Slices an in-memory array for offset-based pagination and returns
 * a fully annotated result object.
 */
export const paginate = <T>(items: T[], page: number, limit: number): PaginatedResult<T> => {
	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const safePage = Math.min(Math.max(1, page), totalPages);
	const offset = (safePage - 1) * limit;
	const data = items.slice(offset, offset + limit);

	return {
		data,
		total,
		page: safePage,
		limit,
		totalPages,
		hasNext: safePage < totalPages,
		hasPrev: safePage > 1,
	};
};

export interface CursorQuery {
	limit: number;
	cursor: string | null;
}

/**
 * Parses a cursor token and limit for cursor-based pagination.
 * The cursor is an opaque base-64 encoded string (or null for the first page).
 */
export const buildCursorQuery = (cursor?: string, limit = 20): CursorQuery => {
	const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
	const safeCursor = typeof cursor === 'string' && cursor.length > 0 ? cursor : null;
	return { limit: safeLimit, cursor: safeCursor };
};
