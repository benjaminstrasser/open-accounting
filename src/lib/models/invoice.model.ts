import { z } from 'zod';

export const DraftInvoiceSchema = z.object({
	images: z
		.array(z.instanceof(File, { message: 'Please upload a file.' }))
		.min(1, 'At least one file is required.')
		.default([])
});
