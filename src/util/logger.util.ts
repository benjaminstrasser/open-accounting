import { LOG_LEVEL } from '$env/static/private';
import pino from 'pino';

export const loggerInstance = pino({
	level: LOG_LEVEL,
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true
		}
	},
	redact: ['headers["set-cookie"]', 'headers["Authorization"]'],
	formatters: {
		level: (label) => ({ level: label })
	}
});

export const createLogger = (payload: Record<string, string>) => loggerInstance.child(payload);

export const createRequestLogger = ({ headers }: Request, { pathname, search }: URL) => {
	const start = Date.now();
	const trace_id = headers.get('X-Request-ID');
	const path = pathname + search;
	const logger = loggerInstance.child({ ...(trace_id ? { trace_id } : {}), headers, path });

	logger.trace('incoming request');

	const endRequest = async (response: Response) => {
		const headers: Record<string, string> = {};
		response.headers.forEach((value, key) => (headers[key] = value));

		logger.trace(
			{
				duration: Date.now() - start,
				status: response.status,
				headers
			},
			'request processed'
		);

		return response;
	};

	return [logger, endRequest] as const;
};
