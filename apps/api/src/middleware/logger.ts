import pino from 'pino';
import type { IncomingMessage, ServerResponse } from 'node:http';
// pino-http v9+ ships its own types — use require-style import for ESM compat
import { pinoHttp } from 'pino-http';

const SILENT_PATHS = new Set(['/health', '/readyz']);

export const logger = pino({
	level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
	...(process.env.NODE_ENV !== 'production' && {
		transport: {
			target: 'pino-pretty',
			options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
		},
	}),
});

export const httpLogger = pinoHttp({
	logger,
	autoLogging: {
		ignore: (req: IncomingMessage) => SILENT_PATHS.has(req.url ?? ''),
	},
	customLogLevel: (
		_req: IncomingMessage,
		res: ServerResponse,
		err: Error | undefined,
	): pino.LevelWithSilent => {
		if (err != null || (res.statusCode ?? 0) >= 500) return 'error';
		if ((res.statusCode ?? 0) >= 400) return 'warn';
		return 'info';
	},
	serializers: {
		req: (req: IncomingMessage & { remoteAddress?: string }) => ({
			method: req.method,
			url: req.url,
			remoteAddress: req.remoteAddress,
		}),
		res: (res: ServerResponse) => ({
			statusCode: res.statusCode,
		}),
	},
});
