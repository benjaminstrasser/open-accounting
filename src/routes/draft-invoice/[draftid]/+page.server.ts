// +page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDraftInvoiceById } from '$lib/server/invoice/repository/invoice-repo';

export const ssr = false;

export const load: PageServerLoad = async ({ params }) => {
	const { draftid } = params;

	const draftInvoice = await getDraftInvoiceById(Number.parseInt(draftid));

	if (!draftInvoice) {
		throw error(404, 'Draft Invoice not found');
	}

	console.log(draftInvoice);

	return {
		draftInvoice: {
			file_data: draftInvoice.file_data.toString('base64'),
			filename: draftInvoice.filename,
			id: draftInvoice.id,
			uploaded_at: draftInvoice.uploaded_at
		}
	};
};
