import { Router } from 'express';
import {
	listSubmissions,
	createSubmission,
	deleteSubmission,
	getSubmissionStats,
} from '../controllers/submissionController.js';

const submissionsRouter = Router({ mergeParams: true });

submissionsRouter.get('/', listSubmissions);
submissionsRouter.post('/', createSubmission);
submissionsRouter.get('/stats', getSubmissionStats);
submissionsRouter.delete('/:submissionId', deleteSubmission);

export { submissionsRouter };
