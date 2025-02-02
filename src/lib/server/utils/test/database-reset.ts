import { db } from '../../database/database';
import { CompiledQuery } from 'kysely';

/**
 * Resets the database by truncating tables and restarting identity sequences.
 */
export async function resetDatabase() {
	await db.transaction().execute(async (trx) => {
		await trx.executeQuery(
			CompiledQuery.raw(`TRUNCATE TABLE ledger_entry RESTART IDENTITY CASCADE;`)
		);
		await trx.executeQuery(
			CompiledQuery.raw(`TRUNCATE TABLE journal_entry RESTART IDENTITY CASCADE;`)
		);
		await trx.executeQuery(CompiledQuery.raw(`TRUNCATE TABLE account RESTART IDENTITY CASCADE;`));
	});
}
