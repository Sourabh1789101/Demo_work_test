/**
 * Submission endpoint tests
 *
 * Mocks pool.query so no real DB is required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';

// ---------------------------------------------------------------------------
// Infrastructure mocks (must be set up before app.ts is imported)
// ---------------------------------------------------------------------------

vi.mock('../config/database.js', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn().mockResolvedValue({ query: vi.fn(), release: vi.fn() }),
  },
  initDatabase: vi.fn().mockResolvedValue(undefined),
  seedTemplateCatalog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../data/allCategoriesLoader.js', () => ({
  loadAllTemplateCategories: vi.fn().mockReturnValue([]),
}));
vi.mock('../data/formTemplatesWithDesign.js', () => ({
  TEMPLATE_CATALOG_SEED: [],
}));

vi.mock('../middleware/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  httpLogger: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock('../middleware/rateLimiter.js', () => ({
  generalLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  submissionLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock('../controllers/authController.js', () => ({
  register: vi.fn(), login: vi.fn(), logout: vi.fn(),
  refreshToken: vi.fn(), getProfile: vi.fn(), deleteAccount: vi.fn(),
}));

vi.mock('../middleware/validator.js', () => ({
  validate: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  loginSchema: {},
  registerSchema: {},
}));

// ---------------------------------------------------------------------------
// Import app + mocks
// ---------------------------------------------------------------------------
import { app } from '../app.js';
import { pool } from '../config/database.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const request = supertest(app);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const FORM_ID = 'form-test-001';

const SAMPLE_SUB = {
  id: 'sub-abc-123',
  form_id: FORM_ID,
  data: { name: 'Alice', email: 'alice@example.com' },
  metadata: { ip: '127.0.0.1', userAgent: 'vitest' },
  submitted_at: '2024-06-01T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/forms/:formId/submissions
// ---------------------------------------------------------------------------

describe('GET /api/forms/:formId/submissions', () => {
  it('returns 200 with submission array', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_SUB], rowCount: 1 });

    const res = await request.get(`/api/forms/${FORM_ID}/submissions`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 200 with empty array when no submissions exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request.get(`/api/forms/${FORM_ID}/submissions`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('maps DB row keys to camelCase', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_SUB], rowCount: 1 });

    const res = await request.get(`/api/forms/${FORM_ID}/submissions`);
    const sub = res.body.data[0];

    expect(sub).toHaveProperty('id');
    expect(sub).toHaveProperty('formId');
    expect(sub).toHaveProperty('submittedAt');
  });
});

// ---------------------------------------------------------------------------
// POST /api/forms/:formId/submissions
// ---------------------------------------------------------------------------

describe('POST /api/forms/:formId/submissions', () => {
  it('returns 201 with the created submission', async () => {
    // First query: check form exists
    mockQuery.mockResolvedValueOnce({ rows: [{ id: FORM_ID }], rowCount: 1 });
    // Second query: insert submission
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_SUB], rowCount: 1 });
    // Third query: increment submission_count
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request
      .post(`/api/forms/${FORM_ID}/submissions`)
      .send({ data: { name: 'Alice', email: 'alice@example.com' } });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('returns 400 when data field is missing', async () => {
    const res = await request
      .post(`/api/forms/${FORM_ID}/submissions`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 400 when data is not an object', async () => {
    const res = await request
      .post(`/api/forms/${FORM_ID}/submissions`)
      .send({ data: 'not-an-object' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 when the form does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request
      .post(`/api/forms/nonexistent-form/submissions`)
      .send({ data: { name: 'Bob' } });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORM_NOT_FOUND');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/forms/:formId/submissions/:submissionId
// ---------------------------------------------------------------------------

describe('DELETE /api/forms/:formId/submissions/:submissionId', () => {
  it('returns 200 when submission is deleted', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    mockQuery.mockResolvedValueOnce({ rowCount: 1 }); // decrement count

    const res = await request.delete(
      `/api/forms/${FORM_ID}/submissions/${SAMPLE_SUB.id}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(SAMPLE_SUB.id);
  });

  it('returns 404 when submission does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request.delete(
      `/api/forms/${FORM_ID}/submissions/ghost-sub`,
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ---------------------------------------------------------------------------
// GET /api/forms/:formId/submissions/stats
// ---------------------------------------------------------------------------

describe('GET /api/forms/:formId/submissions/stats', () => {
  it('returns 200 with stats when they exist', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ total: '42', first_at: '2024-01-01T00:00:00Z', last_at: '2024-06-01T00:00:00Z' }],
      rowCount: 1,
    });

    const res = await request.get(`/api/forms/${FORM_ID}/submissions/stats`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(42);
  });
});
