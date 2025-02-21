import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<never>): Promise<void> {
	await db.schema
		.createTable('company')
		.addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('name', 'varchar', (col) => col.notNull())
		.addColumn('street', 'varchar', (col) => col.notNull())
		.addColumn('zip_code', 'varchar', (col) => col.notNull())
		.addColumn('city', 'varchar', (col) => col.notNull())
		.addColumn('country', 'varchar', (col) => col.notNull())
		.addColumn('uid', 'varchar', (col) => col.notNull())
		.addColumn('contact_email', 'varchar')
		.addColumn('contact_phone', 'varchar')
		.addColumn('is_client', 'boolean')
		.execute();
}

export async function down(db: Kysely<never>): Promise<void> {
	await db.schema.dropTable('company').execute();
}
