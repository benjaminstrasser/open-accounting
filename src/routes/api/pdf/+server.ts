import type { RequestHandler } from '@sveltejs/kit';
import puppeteer from 'puppeteer';
import { z } from 'zod';

const generatePdfSchema = z.object({
	url: z.string().trim().url(),
	fileName: z.string().trim().min(1)
});

export const GET: RequestHandler = async ({ request, url: _url, locals: { logger } }) => {
	try {
		const { url, fileName } = generatePdfSchema.parse({
			url: _url.searchParams.get('url'),
			fileName: _url.searchParams.get('fileName')
		});

		const browser = await puppeteer.launch({
			// reference for protocol timeout issue: https://github.com/puppeteer/puppeteer/issues/11640
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
			headless: true
		});

		const page = await browser.newPage();
		await page.setViewport({ width: 1366, height: 768 });

		await page.setExtraHTTPHeaders({ cookie: request.headers.get('cookie') || '' });
		await page.goto(url, { waitUntil: 'networkidle0' });

		const pdfBuffer = await page.pdf({ format: 'A4', scale: 0.7, printBackground: true });

		await browser.close();

		return new Response(pdfBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename*=UTF-8; filename=${encodeURI(fileName)}.pdf`
			}
		});
	} catch (err: unknown) {
		logger.error({ err });

		let message = 'Error generating PDF.';
		if (err instanceof z.ZodError) {
			message = err.message;
		}

		return new Response(message, { status: 400 });
	}
};
