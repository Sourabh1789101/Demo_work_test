import { Router } from 'express';
import {
	createForm,
	deleteForm,
	getForm,
	listForms,
	updateForm,
} from '../controllers/formController.js';

const formsRouter = Router();

formsRouter.get('/', listForms);
formsRouter.get('/:id', getForm);
formsRouter.post('/', createForm);
formsRouter.put('/:id', updateForm);
formsRouter.delete('/:id', deleteForm);

export { formsRouter };

