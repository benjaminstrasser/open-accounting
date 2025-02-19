// +page.server.ts
import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getDraftInvoiceById,
	getInvoiceById,
	processDraftInvoice
} from '$lib/server/invoice/repository/invoice-repo';
import { InvoiceSchema } from '$lib/models/invoice.model';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const ssr = false;

export const load: PageServerLoad = async ({ params }) => {
	const { invoiceid } = params;

	const invoice = await getInvoiceById(Number.parseInt(invoiceid));

	if (!invoice) {
		throw error(404, 'Draft Invoice not found');
	}

	console.log(invoice);

	return {
		form: await superValidate(zod(InvoiceSchema)),
		invoice: {
			...invoice,
			file_data: invoice.file_data.toString('base64')
		}
	};
};
