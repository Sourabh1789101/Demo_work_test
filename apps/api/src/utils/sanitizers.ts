const MAX_STRING_LENGTH = 10_000;

/**
 * Strips HTML tags, trims whitespace, and enforces a maximum character limit.
 */
export const sanitizeString = (input: unknown): string => {
	if (typeof input !== 'string') {
		return '';
	}
	// Strip HTML tags
	const stripped = input.replace(/<[^>]*>/g, '');
	return stripped.trim().slice(0, MAX_STRING_LENGTH);
};

/**
 * Normalises an email address: lowercases and trims whitespace.
 */
export const sanitizeEmail = (input: unknown): string => {
	if (typeof input !== 'string') {
		return '';
	}
	return input.toLowerCase().trim();
};

/**
 * Parses and clamps pagination parameters.
 * Defaults: page = 1, limit = 20. Maximum limit = 100.
 */
export const sanitizePagination = (
	page: unknown,
	limit: unknown,
): { page: number; limit: number } => {
	const parsedPage = Number(page);
	const parsedLimit = Number(limit);

	const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
	const safeLimit =
		Number.isFinite(parsedLimit) && parsedLimit > 0
			? Math.min(Math.floor(parsedLimit), 100)
			: 20;

	return { page: safePage, limit: safeLimit };
};
