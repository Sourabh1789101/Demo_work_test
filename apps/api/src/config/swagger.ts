import type { Express } from 'express';

export const swaggerSpec = {
	openapi: '3.0.0',
	info: {
		title: 'FormBuilder API',
		version: '0.1.0',
		description: 'Enterprise Form Builder REST API',
	},
	servers: [{ url: '/api' }],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas: {
			Error: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: false },
					error: {
						type: 'object',
						properties: {
							code: { type: 'string' },
							message: { type: 'string' },
						},
					},
				},
			},
			User: {
				type: 'object',
				properties: {
					id: { type: 'string' },
					email: { type: 'string', format: 'email' },
					name: { type: 'string' },
					role: { type: 'string', enum: ['user', 'admin'] },
					isVerified: { type: 'boolean' },
					createdAt: { type: 'string', format: 'date-time' },
				},
			},
			AuthResponse: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					data: {
						type: 'object',
						properties: {
							user: { $ref: '#/components/schemas/User' },
							accessToken: { type: 'string' },
							refreshToken: { type: 'string' },
						},
					},
				},
			},
		},
	},
	paths: {
		'/auth/register': {
			post: {
				tags: ['Auth'],
				summary: 'Register a new user',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email', 'password', 'name'],
								properties: {
									email: { type: 'string', format: 'email' },
									password: { type: 'string', minLength: 8 },
									name: { type: 'string', minLength: 2 },
								},
							},
						},
					},
				},
				responses: {
					'201': { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
					'409': { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
				},
			},
		},
		'/auth/login': {
			post: {
				tags: ['Auth'],
				summary: 'Authenticate with email and password',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email', 'password'],
								properties: {
									email: { type: 'string', format: 'email' },
									password: { type: 'string' },
								},
							},
						},
					},
				},
				responses: {
					'200': { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
					'401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
				},
			},
		},
		'/auth/refresh': {
			post: {
				tags: ['Auth'],
				summary: 'Exchange a refresh token for a new access token',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['refreshToken'],
								properties: { refreshToken: { type: 'string' } },
							},
						},
					},
				},
				responses: {
					'200': { description: 'New access token issued' },
					'401': { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
				},
			},
		},
		'/auth/logout': {
			post: {
				tags: ['Auth'],
				summary: 'Invalidate the current refresh token',
				security: [{ bearerAuth: [] }],
				responses: {
					'200': { description: 'Logged out' },
					'401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
				},
			},
		},
		'/auth/profile': {
			get: {
				tags: ['Auth'],
				summary: 'Get the authenticated user profile',
				security: [{ bearerAuth: [] }],
				responses: {
					'200': { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
					'401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
				},
			},
		},
		'/auth/me': {
			delete: {
				tags: ['Auth'],
				summary: 'Permanently delete the authenticated user account (GDPR erasure)',
				security: [{ bearerAuth: [] }],
				responses: {
					'200': { description: 'Account deleted' },
					'401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
				},
			},
		},
	},
};

/**
 * Mounts Swagger UI at `/api/docs` when `swagger-ui-express` is available.
 * Falls back silently (spec is still exported for external tooling).
 */
export const setupSwagger = async (app: Express): Promise<void> => {
	try {
		const swaggerUi = await import('swagger-ui-express');
		app.use('/api/docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerSpec));
	} catch {
		// swagger-ui-express is not installed — spec is available via export only
	}
};
