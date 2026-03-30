/**
 * Health endpoint tests
 *
 * We mock every module that would reach out to external systems (DB, pino
 * transports, rate-limiter stores, etc.) so the test runs without any
 * infrastructure.
 */

import { describe, it, expect, vi } from 'vitest';
import supertest from 'supertest';

// ---------------------------------------------------------------------------
// Database – must be mocked before app.ts is imported
// ---------------------------------------------------------------------------
vi.mock('../config/database.js', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn().mockResolvedValue({ query: vi.fn(), release: vi.fn() }),
  },
  initDatabase: vi.fn().mockResolvedValue(undefined),
  seedTemplateCatalog: vi.fn().mockResolvedValue(undefined),
}));

// Data modules imported transitively through database.js
vi.mock('../data/allCategoriesLoader.js', () => ({
  loadAllTemplateCategories: vi.fn().mockReturnValue([]),
}));
vi.mock('../data/formTemplatesWithDesign.js', () => ({
  TEMPLATE_CATALOG_SEED: [],
}));

// ---------------------------------------------------------------------------
// Middleware that writes to stdout/file system (pino)
// ---------------------------------------------------------------------------
vi.mock('../middleware/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  httpLogger: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

// ---------------------------------------------------------------------------
// Rate limiter – pass through in tests
// ---------------------------------------------------------------------------
vi.mock('../middleware/rateLimiter.js', () => ({
  generalLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  submissionLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------
vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

// ---------------------------------------------------------------------------
// Auth controller (so the authRouter import doesn't blow up)
// ---------------------------------------------------------------------------
vi.mock('../controllers/authController.js', () => ({
  register: vi.fn((_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(501).json({}),
  ),
  login: vi.fn((_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(501).json({}),
  ),
  logout: vi.fn((_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(501).json({}),
  ),
  refreshToken: vi.fn((_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(501).json({}),
  ),
  getProfile: vi.fn((_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(501).json({}),
  ),
  deleteAccount: vi.fn((_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(501).json({}),
  ),
}));

// Validator middleware (Joi / Zod wrapper)
vi.mock('../middleware/validator.js', () => ({
  validate: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  loginSchema: {},
  registerSchema: {},
}));

import { app } from '../app.js';

const request = supertest(app);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /health', () => {
  it('returns 200 with status ok and service api', async () => {
    const response = await request.get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'api',
    });
  });

  it('includes a timestamp field', async () => {
    const response = await request.get('/health');
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('returns application/json content-type', async () => {
    const response = await request.get('/health');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('GET /readyz', () => {
  it('returns 200 with status ready', async () => {
    const response = await request.get('/readyz');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ready' });
  });
});

describe('unknown routes', () => {
  it('returns 404 JSON for an unknown path', async () => {
    const response = await request.get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'NOT_FOUND' },
    });
  });
});
