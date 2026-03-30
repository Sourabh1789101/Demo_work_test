/**
 * Forms CRUD endpoint tests
 *
 * The PostgreSQL pool.query is mocked so no real DB is required.
 * FormService calls pool.query directly, so we intercept at that level.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';

// ---------------------------------------------------------------------------
// Infrastructure mocks (same set as health.test.ts)
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
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  getProfile: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock('../middleware/validator.js', () => ({
  validate: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  loginSchema: {},
  registerSchema: {},
}));

// ---------------------------------------------------------------------------
// Import app + pool mock AFTER vi.mock calls are set up
// ---------------------------------------------------------------------------
import { app } from '../app.js';
import { pool } from '../config/database.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const request = supertest(app);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SAMPLE_FORM = {
  id: 'form-abc-123',
  title: 'Test Form',
  description: 'A test form',
  schema: { id: 'form-abc-123', title: 'Test Form', components: [] },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const SAMPLE_FORM_2 = {
  id: 'form-xyz-456',
  title: 'Second Form',
  description: null,
  schema: { id: 'form-xyz-456', title: 'Second Form', components: [] },
  created_at: '2024-01-02T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/forms
// ---------------------------------------------------------------------------

describe('GET /api/forms', () => {
  it('returns 200 with an array of forms', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [SAMPLE_FORM, SAMPLE_FORM_2],
      rowCount: 2,
    });

    const response = await request.get('/api/forms');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('returns 200 with empty array when no forms exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request.get('/api/forms');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });

  it('maps snake_case DB columns to camelCase in response', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_FORM], rowCount: 1 });

    const response = await request.get('/api/forms');
    const form = response.body.data[0];

    expect(form).toHaveProperty('id', SAMPLE_FORM.id);
    expect(form).toHaveProperty('title', SAMPLE_FORM.title);
    expect(form).toHaveProperty('createdAt');
    expect(form).toHaveProperty('updatedAt');
  });
});

// ---------------------------------------------------------------------------
// GET /api/forms/:id
// ---------------------------------------------------------------------------

describe('GET /api/forms/:id', () => {
  it('returns 200 with the form when it exists', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_FORM], rowCount: 1 });

    const response = await request.get(`/api/forms/${SAMPLE_FORM.id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(SAMPLE_FORM.id);
    expect(response.body.data.title).toBe(SAMPLE_FORM.title);
  });

  it('returns 404 when form does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request.get('/api/forms/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('FORM_NOT_FOUND');
  });
});

// ---------------------------------------------------------------------------
// POST /api/forms
// ---------------------------------------------------------------------------

describe('POST /api/forms', () => {
  it('returns 201 with the created form', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_FORM], rowCount: 1 });

    const response = await request
      .post('/api/forms')
      .send({ schema: { id: SAMPLE_FORM.id, title: SAMPLE_FORM.title, components: [] } });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(SAMPLE_FORM.id);
  });

  it('returns 400 when schema.id is missing', async () => {
    const response = await request
      .post('/api/forms')
      .send({ schema: { title: 'No ID Form', components: [] } });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 400 when body is not an object', async () => {
    const response = await request
      .post('/api/forms')
      .send({ schema: null });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('defaults title to "Untitled Form" when title is blank', async () => {
    const formWithNoTitle = { ...SAMPLE_FORM, title: 'Untitled Form' };
    mockQuery.mockResolvedValueOnce({ rows: [formWithNoTitle], rowCount: 1 });

    const response = await request
      .post('/api/forms')
      .send({ schema: { id: 'new-id-001', components: [] } }); // no title

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Untitled Form');
  });
});

// ---------------------------------------------------------------------------
// PUT /api/forms/:id
// ---------------------------------------------------------------------------

describe('PUT /api/forms/:id', () => {
  it('returns 200 with the updated form', async () => {
    const updated = { ...SAMPLE_FORM, title: 'Updated Title' };
    mockQuery.mockResolvedValueOnce({ rows: [updated], rowCount: 1 });

    const response = await request
      .put(`/api/forms/${SAMPLE_FORM.id}`)
      .send({ schema: { id: SAMPLE_FORM.id, title: 'Updated Title', components: [] } });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Updated Title');
  });

  it('returns 400 when schema is not an object', async () => {
    const response = await request
      .put(`/api/forms/${SAMPLE_FORM.id}`)
      .send({ schema: 'not-an-object' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/forms/:id
// ---------------------------------------------------------------------------

describe('DELETE /api/forms/:id', () => {
  it('returns 200 when the form is deleted', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const response = await request.delete(`/api/forms/${SAMPLE_FORM.id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(SAMPLE_FORM.id);
  });

  it('returns 404 when the form does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const response = await request.delete('/api/forms/ghost-id');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('FORM_NOT_FOUND');
  });
});
