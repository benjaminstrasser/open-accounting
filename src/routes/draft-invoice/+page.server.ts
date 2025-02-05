import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { createDraftInvoice, getAllDraftInvoices } from '$lib/server/invoice/repository/invoice-repo';
import { DraftInvoiceSchema } from '$lib/models/invoice.model';


export const load: PageServerLoad = async () => {
	// Initialize the form with an empty images array and also fetch the existing drafts.
	const form = await superValidate({ images: [] }, zod(DraftInvoiceSchema));
	const drafts = await getAllDraftInvoices();
	return { form, drafts };
};

export const actions: Actions = {
	default: async ({ request }) => {
		// Validate the incoming form submission.
		const form = await superValidate(request, zod(DraftInvoiceSchema));
		if (!form.valid) {
			return message(form, 'Upload failed', { status: 400 });
		}

		// Process each uploaded file.
		// form.data.images is an array of File objects.
		for (const file of form.data.images) {
			// Convert the file to an ArrayBuffer then to a Node Buffer.
			const fileBuffer = Buffer.from(await file.arrayBuffer());
			// Call your repository function to create a draft invoice.
			await createDraftInvoice(fileBuffer, file.name);
		}

		return message(form, 'Draft invoices uploaded successfully!');
	}
};
