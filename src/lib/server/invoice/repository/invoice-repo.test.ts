import { beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../utils/test/database-reset';
import {
	createDraftInvoice,
	getDraftInvoiceById,
	getAllDraftInvoices,
	deleteDraftInvoice,
	processDraftInvoice,
	getInvoiceById,
	getAllInvoices
} from './invoice-repo';
import { db } from '$lib/server/database/database';
describe('Invoice Repository Tests', () => {
	beforeEach(async () => {
		await resetDatabase();
		// Explicitly clear out both tables before each test.
		await db.deleteFrom('invoice').execute();
		await db.deleteFrom('draft_invoice').execute();
	});

	// --- Draft Invoice Function Tests ---
	describe('Draft Invoice Functions', () => {
		describe('createDraftInvoice', () => {
			it('should create a new draft invoice', async () => {
				const fileData = Buffer.from('Test file content');
				const filename = 'test.pdf';
				const draft = await createDraftInvoice(fileData, filename);
				expect(draft).toBeDefined();
				expect(draft.id).toBeGreaterThan(0);
				expect(draft.filename).toBe(filename);
				expect(Buffer.isBuffer(draft.file_data)).toBe(true);
			});
		});

		describe('getDraftInvoiceById', () => {
			it('should retrieve a draft invoice by id', async () => {
				const fileData = Buffer.from('Test file content');
				const filename = 'test.pdf';
				const created = await createDraftInvoice(fileData, filename);
				const retrieved = await getDraftInvoiceById(created.id);
				expect(retrieved).toBeDefined();
				expect(retrieved.id).toBe(created.id);
				expect(retrieved.filename).toBe(filename);
			});
		});

		describe('getAllDraftInvoices', () => {
			it('should retrieve all draft invoices', async () => {
				const fileData1 = Buffer.from('Test file content 1');
				const fileData2 = Buffer.from('Test file content 2');
				await createDraftInvoice(fileData1, 'test1.pdf');
				await createDraftInvoice(fileData2, 'test2.pdf');
				const drafts = await getAllDraftInvoices();
				expect(drafts.length).toBe(2);
			});
		});

		describe('deleteDraftInvoice', () => {
			it('should delete a draft invoice', async () => {
				const fileData = Buffer.from('Test file content');
				const filename = 'test.pdf';
				const draft = await createDraftInvoice(fileData, filename);
				await deleteDraftInvoice(draft.id);
				await expect(getDraftInvoiceById(draft.id)).rejects.toThrowError();
			});
		});
	});

	// --- Invoice (Finalized) Function Tests ---
	describe('Invoice Functions', () => {
		describe('processDraftInvoice', () => {
			it('should process a draft invoice into a finalized invoice (happy path)', async () => {
				const fileData = Buffer.from('Test file content');
				const filename = 'test.pdf';
				// Create a draft invoice first.
				const draft = await createDraftInvoice(fileData, filename);

				// Process the draft into a finalized invoice.
				const supplier = 'Test Supplier';
				const amount = 1000; // in cents
				const invoiceDate = '2023-10-01';
				const vat = 200; // in cents

				const invoice = await processDraftInvoice(draft.id, supplier, amount, invoiceDate, vat);
				expect(invoice).toBeDefined();
				expect(invoice.id).toBeGreaterThan(0);
				expect(invoice.filename).toBe(filename);
				expect(invoice.supplier).toBe(supplier);
				expect(invoice.amount).toBe(amount);
				// Compare date parts to work around timezone issues.
				const actualDate = new Date(invoice.invoice_date);
				const expectedDate = new Date(invoiceDate);
				expect(actualDate.getFullYear()).toBe(expectedDate.getFullYear());
				expect(actualDate.getMonth()).toBe(expectedDate.getMonth());
				expect(actualDate.getDate()).toBe(expectedDate.getDate());
				expect(invoice.vat).toBe(vat);

				// Verify that the draft is deleted.
				await expect(getDraftInvoiceById(draft.id)).rejects.toThrowError();
			});

			describe('Edge Cases & Validation', () => {
				it('should throw an error when processing a non-existent draft invoice', async () => {
					await expect(
						processDraftInvoice(9999, 'Supplier', 1000, '2023-10-01', 200)
					).rejects.toThrowError();
				});

				it('should throw an error when invoiceDate is invalid', async () => {
					const fileData = Buffer.from('Test file content');
					const filename = 'test.pdf';
					const draft = await createDraftInvoice(fileData, filename);
					await expect(
						processDraftInvoice(draft.id, 'Supplier', 1000, 'invalid-date', 200)
					).rejects.toThrowError();
				});

				it.skip('should throw an error when amount is negative', async () => {
					const fileData = Buffer.from('Test file content');
					const filename = 'test.pdf';
					const draft = await createDraftInvoice(fileData, filename);
					await expect(
						processDraftInvoice(draft.id, 'Supplier', -1000, '2023-10-01', 200)
					).rejects.toThrowError();
				});

				it.skip('should throw an error when VAT is negative', async () => {
					const fileData = Buffer.from('Test file content');
					const filename = 'test.pdf';
					const draft = await createDraftInvoice(fileData, filename);
					await expect(
						processDraftInvoice(draft.id, 'Supplier', 1000, '2023-10-01', -200)
					).rejects.toThrowError();
				});

				it.skip('should throw an error when supplier is empty', async () => {
					const fileData = Buffer.from('Test file content');
					const filename = 'test.pdf';
					const draft = await createDraftInvoice(fileData, filename);
					await expect(
						processDraftInvoice(draft.id, '', 1000, '2023-10-01', 200)
					).rejects.toThrowError();
				});
			});
		});

		describe('getInvoiceById', () => {
			it('should retrieve a finalized invoice by id', async () => {
				const fileData = Buffer.from('Test file content');
				const filename = 'test.pdf';
				const draft = await createDraftInvoice(fileData, filename);
				const supplier = 'Test Supplier';
				const amount = 1000;
				const invoiceDate = '2023-10-01';
				const vat = 200;
				const processedInvoice = await processDraftInvoice(
					draft.id,
					supplier,
					amount,
					invoiceDate,
					vat
				);
				const retrieved = await getInvoiceById(processedInvoice.id);
				expect(retrieved).toBeDefined();
				expect(retrieved.id).toBe(processedInvoice.id);
				expect(retrieved.supplier).toBe(supplier);
			});
		});

		describe('getAllInvoices', () => {
			it('should retrieve all finalized invoices', async () => {
				// Process two draft invoices.
				const fileData1 = Buffer.from('Test file content 1');
				const fileData2 = Buffer.from('Test file content 2');
				const draft1 = await createDraftInvoice(fileData1, 'test1.pdf');
				const draft2 = await createDraftInvoice(fileData2, 'test2.pdf');
				await processDraftInvoice(draft1.id, 'Supplier 1', 1000, '2023-10-01', 200);
				await processDraftInvoice(draft2.id, 'Supplier 2', 2000, '2023-10-02', 300);
				const invoices = await getAllInvoices();
				expect(invoices.length).toBe(2);
			});
		});
	});
});
