import type { Handle } from '@sveltejs/kit';
import { createRequestLogger } from './util/logger.util';

export const handle: Handle = async ({ event, resolve }) => {
	const { locals, request, url } = event;

	const [logger, endRequest] = createRequestLogger(request, url);

	locals.logger = logger;

	return endRequest(await resolve(event));
};
