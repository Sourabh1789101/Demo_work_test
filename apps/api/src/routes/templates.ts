import { Router } from 'express';
import {
	getTemplateById,
	listTemplateCategories,
	submitTemplateResponse,
} from '../controllers/templateController.js';

const templatesRouter = Router();

templatesRouter.get('/categories', listTemplateCategories);
templatesRouter.get('/:templateId', getTemplateById);
templatesRouter.post('/:templateId/responses', submitTemplateResponse);

export { templatesRouter };

