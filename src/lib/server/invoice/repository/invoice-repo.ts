import { db } from '../../database/database';
import type { Selectable } from 'kysely';
import type { DraftInvoice, Invoice } from '$lib/server/database/database-types';

/**
 * Creates a new draft invoice record.
 *
 * @param fileData - The binary data of the PDF file.
 * @param filename - The original filename.
 * @returns The inserted draft invoice record.
 */
export async function createDraftInvoice(
	fileData: Buffer,
	filename: string
): Promise<Selectable<DraftInvoice>> {
	return await db
		.insertInto('draft_invoice')
		.values({
			file_data: fileData,
			filename: filename
		})
		.returningAll()
		.executeTakeFirstOrThrow();
}

/**
 * Retrieves a draft invoice by its ID.
 *
 * @param id - The ID of the draft invoice.
 * @returns The draft invoice record.
 */
export async function getDraftInvoiceById(
	id: number
): Promise<Selectable<DraftInvoice>> {
	return await db
		.selectFrom('draft_invoice')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirstOrThrow();
}

/**
 * Retrieves all draft invoices.
 *
 * @returns An array of draft invoice records.
 */
export async function getAllDraftInvoices(): Promise<Selectable<DraftInvoice>[]> {
	return await db.selectFrom('draft_invoice').selectAll().execute();
}

/**
 * Deletes a draft invoice by its ID.
 *
 * @param id - The ID of the draft invoice to delete.
 */
export async function deleteDraftInvoice(id: number): Promise<void> {
	await db.deleteFrom('draft_invoice').where('id', '=', id).execute();
}

/**
 * Processes a draft invoice to create a finalized invoice.
 * This function retrieves the draft invoice, creates a new invoice record with the additional metadata,
 * and then deletes the draft invoice. The process is executed in a single transaction.
 *
 * @param draftId - The ID of the draft invoice.
 * @param supplier - The supplier name entered by the user.
 * @param amount - The invoice amount in cents (must be a positive integer).
 * @param invoiceDate - The invoice date as a string (e.g. 'YYYY-MM-DD').
 * @param vat - The VAT amount in cents (must be a positive integer).
 * @returns The newly created invoice record.
 */
export async function processDraftInvoice(
	draftId: number,
	supplier: string,
	amount: number,
	invoiceDate: string,
	vat: number
): Promise<Selectable<Invoice>> {
	return await db.transaction().execute(async (trx) => {
		// Retrieve the draft invoice record.
		const draft = await trx
			.selectFrom('draft_invoice')
			.where('id', '=', draftId)
			.select(['file_data', 'filename'])
			.executeTakeFirstOrThrow();

		// Insert the finalized invoice with the draft's file data and additional metadata.
		const invoice = await trx
			.insertInto('invoice')
			.values({
				file_data: draft.file_data,
				filename: draft.filename,
				supplier,
				amount,
				invoice_date: invoiceDate,
				vat
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		// Delete the draft invoice record.
		await trx.deleteFrom('draft_invoice').where('id', '=', draftId).execute();

		return invoice;
	});
}

/**
 * Retrieves a finalized invoice by its ID.
 *
 * @param id - The ID of the invoice.
 * @returns The invoice record.
 */
export async function getInvoiceById(
	id: number
): Promise<Selectable<Invoice>> {
	return await db
		.selectFrom('invoice')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirstOrThrow();
}

/**
 * Retrieves all finalized invoices.
 *
 * @returns An array of invoice records.
 */
export async function getAllInvoices(): Promise<Selectable<Invoice>[]> {
	return await db.selectFrom('invoice').selectAll().execute();
}
