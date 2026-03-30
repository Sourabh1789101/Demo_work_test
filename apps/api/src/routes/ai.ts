import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { aiGenerationLimiter } from '../middleware/rateLimiter.js';
import { NIMAIFormGeneratorService } from '../services/NIMAIFormGeneratorService.js';
import { pool } from '../config/database.js';

const aiRouter = Router();

// POST /api/ai/generate-form - Generate a form from a prompt using NVIDIA NIM
aiRouter.post(
  '/generate-form',
  authenticateToken,
  aiGenerationLimiter,
  async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        });
      }

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: { message: 'Prompt is required' },
        });
      }

      // Validate prompt
      const validation = NIMAIFormGeneratorService.validatePrompt(prompt);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: { message: validation.error || 'Invalid prompt' },
        });
      }

      // Generate form using NVIDIA NIM
      const { schema, tokensUsed } = await NIMAIFormGeneratorService.generateFormFromPrompt({
        prompt,
        userId,
      });

      // Save the form to database
      const now = new Date();
      const query = `
        INSERT INTO forms (id, user_id, title, description, schema, ai_generated, generation_metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;

      const generationMetadata = {
        prompt,
        tokensUsed,
        generatedAt: now.toISOString(),
        model: 'meta/llama-3.1-405b-instruct',
        provider: 'NVIDIA NIM',
      };

      const result = await pool.query(query, [
        schema.id,
        userId,
        schema.title,
        schema.description || '',
        JSON.stringify(schema),
        true, // ai_generated = true
        JSON.stringify(generationMetadata),
        now,
        now,
      ]);

      res.status(201).json({
        success: true,
        data: {
          form: {
            id: schema.id,
            title: schema.title,
            description: schema.description,
            schema,
          },
          tokensUsed,
          provider: 'NVIDIA NIM (Free Tier)',
        },
      });
    } catch (error) {
      console.error('AI form generation error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to generate form';

      // Check for specific error types
      if (errorMessage.includes('NVIDIA_NIM_API_KEY')) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'AI generation is not configured. Please set NVIDIA_NIM_API_KEY environment variable.',
          },
        });
      }

      if (errorMessage.includes('NVIDIA NIM API error')) {
        return res.status(503).json({
          success: false,
          error: {
            message: 'NVIDIA NIM API is temporarily unavailable. Please try again later.',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
        },
      });
    }
  },
);

export { aiRouter };

