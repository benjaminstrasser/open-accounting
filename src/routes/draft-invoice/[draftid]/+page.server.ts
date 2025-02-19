// +page.server.ts
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getDraftInvoiceById,
	processDraftInvoice
} from '$lib/server/invoice/repository/invoice-repo';
import { InvoiceSchema } from '$lib/models/invoice.model';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const ssr = false;

export const load: PageServerLoad = async ({ params }) => {
	const { draftid } = params;

	const draftInvoice = await getDraftInvoiceById(Number.parseInt(draftid));

	if (!draftInvoice) {
		throw error(404, 'Draft Invoice not found');
	}

	console.log(draftInvoice);

	return {
		form: await superValidate(zod(InvoiceSchema)),
		draftInvoice: {
			...draftInvoice,
			file_data: draftInvoice.file_data.toString('base64')
		}
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(InvoiceSchema));
		if (!form.valid) {
			return message(form, 'Form Invalid', { status: 400 });
		}
		let invoice;
		try {
			invoice = await processDraftInvoice(
				form.data.id,
				form.data.supplier,
				form.data.amount,
				form.data.invoice_date,
				form.data.vat
			);
		} catch (e: unknown) {
			console.error(e);
			return message(form, 'Error Creating ', { status: 500 });
		}

		return redirect(303, `/invoice/${invoice.id}`);
	}
};
