import type { Request, Response } from 'express';
import { FormService } from '../services/FormService.js';

const getRouteId = (request: Request): string | null => {
	const raw = request.params.id;
	if (typeof raw === 'string') return raw;
	if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') return raw[0];
	return null;
};

const toUpsertPayload = (request: Request) => {
	const schema = request.body?.schema ?? request.body;
	if (!schema || typeof schema !== 'object') {
		return { error: 'Invalid payload: expected a schema object' };
	}

	const id = getRouteId(request) || schema.id;
	if (!id || typeof id !== 'string') {
		return { error: 'Invalid payload: schema.id is required' };
	}

	const title = typeof schema.title === 'string' && schema.title.trim().length > 0
		? schema.title
		: 'Untitled Form';

	return {
		payload: {
			id,
			title,
			description: typeof schema.description === 'string' ? schema.description : '',
			schema,
		},
	};
};

export const listForms = async (_request: Request, response: Response) => {
	const forms = await FormService.listForms();
	response.status(200).json({ success: true, data: forms });
};

export const getForm = async (request: Request, response: Response) => {
	const id = getRouteId(request);
	if (!id) {
		response.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Form id is required' } });
		return;
	}

	const form = await FormService.getFormById(id);

	if (!form) {
		response.status(404).json({ success: false, error: { code: 'FORM_NOT_FOUND', message: 'Form not found' } });
		return;
	}

	response.status(200).json({ success: true, data: form });
};

export const createForm = async (request: Request, response: Response) => {
	const parsed = toUpsertPayload(request);
	if ('error' in parsed) {
		response.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: parsed.error } });
		return;
	}

	const form = await FormService.upsertForm(parsed.payload);
	response.status(201).json({ success: true, data: form });
};

export const updateForm = async (request: Request, response: Response) => {
	const parsed = toUpsertPayload(request);
	if ('error' in parsed) {
		response.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: parsed.error } });
		return;
	}

	const form = await FormService.upsertForm(parsed.payload);
	response.status(200).json({ success: true, data: form });
};

export const deleteForm = async (request: Request, response: Response) => {
	const id = getRouteId(request);
	if (!id) {
		response.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Form id is required' } });
		return;
	}

	const deleted = await FormService.deleteForm(id);

	if (!deleted) {
		response.status(404).json({ success: false, error: { code: 'FORM_NOT_FOUND', message: 'Form not found' } });
		return;
	}

	response.status(200).json({ success: true, data: { id } });
};

