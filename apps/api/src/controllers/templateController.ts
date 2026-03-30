import type { Request, Response } from 'express';
import type { TemplateAnswers } from '../types/templateCatalog.js';
import { TemplateCatalogService } from '../services/TemplateCatalogService.js';

const getTemplateId = (request: Request): string | null => {
	const raw = request.params.templateId;
	if (typeof raw === 'string') return raw;
	if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') return raw[0];
	return null;
};

export const listTemplateCategories = async (_request: Request, response: Response) => {
	const categories = await TemplateCatalogService.listTemplateCategories();
	response.status(200).json({ success: true, data: categories });
};

export const getTemplateById = async (request: Request, response: Response) => {
	const templateId = getTemplateId(request);
	if (!templateId) {
		response.status(400).json({
			success: false,
			error: { code: 'BAD_REQUEST', message: 'Template id is required' },
		});
		return;
	}

	const template = await TemplateCatalogService.getTemplateById(templateId);

	if (!template) {
		response.status(404).json({
			success: false,
			error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' },
		});
		return;
	}

	response.status(200).json({ success: true, data: template });
};

export const submitTemplateResponse = async (request: Request, response: Response) => {
	const templateId = getTemplateId(request);
	if (!templateId) {
		response.status(400).json({
			success: false,
			error: { code: 'BAD_REQUEST', message: 'Template id is required' },
		});
		return;
	}

	const answers = request.body?.answers;
	if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
		response.status(400).json({
			success: false,
			error: {
				code: 'BAD_REQUEST',
				message: 'Invalid payload: expected an answers object',
			},
		});
		return;
	}

	const template = await TemplateCatalogService.getTemplateById(templateId);
	if (!template) {
		response.status(404).json({
			success: false,
			error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' },
		});
		return;
	}

	const storedResponse = await TemplateCatalogService.createTemplateResponse(templateId, answers as TemplateAnswers);
	response.status(201).json({ success: true, data: storedResponse });
};

