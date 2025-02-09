import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<never>): Promise<void> {
	// Create the draft_invoice table for storing uploaded PDF files as drafts.
	await db.schema
		.createTable('draft_invoice')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('file_data', 'bytea', (col) => col.notNull())
		.addColumn('filename', 'varchar', (col) => col.notNull())
		.addColumn('uploaded_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	// Create the invoice table for finalized invoices.
	// This table is completely separate from draft_invoice.
	// When processing a draft, the file and its metadata are copied here.
	await db.schema
		.createTable('invoice')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('file_data', 'bytea', (col) => col.notNull())
		.addColumn('filename', 'varchar', (col) => col.notNull())
		.addColumn('supplier', 'varchar', (col) => col.notNull())
		// Store amount in cents as an integer.
		.addColumn('amount', 'integer', (col) => col.notNull())
		.addColumn('invoice_date', 'date', (col) => col.notNull())
		// Store VAT in cents as an integer.
		.addColumn('vat', 'integer', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
		.execute();
}

export async function down(db: Kysely<never>): Promise<void> {
	await db.schema.dropTable('invoice').execute();
	await db.schema.dropTable('draft_invoice').execute();
}
