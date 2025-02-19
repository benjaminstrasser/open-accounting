import { getAllInvoices } from '$lib/server/invoice/repository/invoice-repo';
import type { a } from 'vitest/dist/chunks/suite.BJU7kdY9.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		invoices: (await getAllInvoices()).map((invoice) => {
			return {
				id: invoice.id,
				filename: invoice.filename,
				invoice_date: invoice.invoice_date,
				amount: invoice.amount,
				supplier: invoice.supplier,
				vat: invoice.vat
			};
		})
	};
};
