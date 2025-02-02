import { CompiledQuery, Kysely, sql } from 'kysely';

export async function up(db: Kysely<never>): Promise<void> {
	// Create ENUM type for debit/credit
	await db.executeQuery(CompiledQuery.raw(`CREATE TYPE debit_credit AS ENUM ('debit', 'credit');`));

	// Accounts Table (Austrian EKR Structure)
	await db.schema
		.createTable('account')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('account_number', 'varchar(10)', (col) => col.unique().notNull()) // EKR numbering (e.g., 2800, 4000)
		.addColumn('name', 'varchar', (col) => col.notNull()) // Account name
		.addColumn('type', 'varchar(50)', (col) => col.notNull()) // Asset, Liability, Equity, Revenue, Expense
		.addColumn('normal_balance', sql`debit_credit`, (col) => col.notNull()) // "debit" or "credit"
		.execute();

	// Journal Entry Table
	await db.schema
		.createTable('journal_entry')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('description', 'varchar', (col) => col.notNull()) // Transaction description
		.addColumn('date', 'date', (col) =>
			col.notNull().defaultTo(sql`now
    ()`)
		)
		.execute();

	// Ledger Entry Table (Links Journal Entries to Accounts)
	await db.schema
		.createTable('ledger_entry')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('journal_entry_id', 'integer', (col) =>
			col.references('journal_entry.id').onDelete('cascade').notNull()
		)
		.addColumn('account_id', 'integer', (col) =>
			col.references('account.id').onDelete('no action').notNull()
		)
		.addColumn('amount', 'integer', (col) => col.notNull()) // Stored in cents
		.addColumn('side', sql`debit_credit`, (col) => col.notNull()) // "debit" or "credit"
		.execute();

	// Create trigger function to ensure journal entries balance
	await db.executeQuery(
		CompiledQuery.raw(`
    CREATE FUNCTION ensure_journal_balance() RETURNS TRIGGER AS $$
    BEGIN
      IF (SELECT 
            SUM(CASE WHEN side = 'debit' THEN amount ELSE 0 END) - 
            SUM(CASE WHEN side = 'credit' THEN amount ELSE 0 END)
          FROM ledger_entry
          WHERE journal_entry_id = NEW.journal_entry_id) <> 0 
      THEN
        RAISE EXCEPTION 'Journal entry must be balanced (debits = credits)';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)
	);

	// Attach trigger to ledger_entry table
	await db.executeQuery(
		CompiledQuery.raw(`
CREATE CONSTRAINT TRIGGER check_journal_balance
    AFTER INSERT OR UPDATE ON ledger_entry
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION ensure_journal_balance();`)
	);
}

export async function down(db: Kysely<never>): Promise<void> {
	await db.schema.dropTable('ledger_entry').execute();
	await db.schema.dropTable('journal_entry').execute();
	await db.schema.dropTable('account').execute();
	await db.schema.dropTable('bill').execute();
	await db.schema.dropTable('invoice').execute();
	await db.executeQuery(CompiledQuery.raw(`DROP TYPE debit_credit;`));
}
