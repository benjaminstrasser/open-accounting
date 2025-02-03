import { db } from '../../database/database';
import { type CreateJournalWithEntries, type GetJournalEntry } from '$lib/models/ledger.model';
import type { Selectable } from 'kysely';
import type { DebitCredit, JournalEntry, LedgerEntry } from '$lib/server/database/database-types'; // Update with the correct relative path to your Zod types

/**
 * Creates a journal entry with associated ledger entries.
 * Ensures that the journal entry is balanced before committing.
 */
export async function createJournalEntry(
	payload: CreateJournalWithEntries
): Promise<Selectable<JournalEntry>> {
	const { journal, ledgerEntries } = payload;

	return await db.transaction().execute(async (trx) => {
		// Insert the journal entry
		const createdJournal = await trx
			.insertInto('journal_entry')
			.values(journal)
			.returningAll()
			.executeTakeFirstOrThrow();

		// Attach ledger entries to the journal
		for (const entry of ledgerEntries) {
			await trx
				.insertInto('ledger_entry')
				.values({
					...entry,
					journal_entry_id: createdJournal.id // Link the journal entry to each ledger entry
				})
				.executeTakeFirstOrThrow();
		}

		return createdJournal;
	});
}

/**
 * Retrieves a journal entry by ID.
 */
export async function getJournalEntryById(id: number): Promise<Selectable<JournalEntry>> {
	return db.selectFrom('journal_entry').where('id', '=', id).selectAll().executeTakeFirstOrThrow();
}

/**
 * Retrieves all journal entries.
 */
export async function getAllJournalEntries(): Promise<Selectable<JournalEntry>[]> {
	return db.selectFrom('journal_entry').selectAll().execute();
}

/**
 * Retrieves ledger entries associated with a journal entry.
 */
export async function getLedgerEntriesByJournalEntry(
	journalEntryId: number
): Promise<Selectable<LedgerEntry>[]> {
	return db
		.selectFrom('ledger_entry')
		.where('journal_entry_id', '=', journalEntryId)
		.selectAll()
		.execute();
}

/**
 * Deletes a journal entry and its related ledger entries.
 */
export async function deleteJournalEntry(id: number): Promise<void> {
	await db.transaction().execute(async (trx) => {
		await trx.deleteFrom('ledger_entry').where('journal_entry_id', '=', id).execute();
		await trx.deleteFrom('journal_entry').where('id', '=', id).executeTakeFirstOrThrow();
	});
}

/**
 * Retrieves a single journal entry by ID along with its associated ledger entries.
 */
export async function getJournalEntryWithLedgerById(id: number): Promise<GetJournalEntry> {
	const journalEntry = await db
		.selectFrom('journal_entry')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirstOrThrow();

	const ledgerEntries = await db
		.selectFrom('ledger_entry')
		.where('journal_entry_id', '=', id)
		.selectAll()
		.execute();

	return { ...journalEntry, ledgerEntries };
}

/**
 * Retrieves all journal entries with their associated ledger entries.
 */
export async function getAllJournalsWithLedgerEntries(): Promise<GetJournalEntry[]> {
	const values = await db
		.selectFrom('journal_entry as j')
		.innerJoin('ledger_entry as l', 'l.journal_entry_id', 'j.id')
		.select([
			'j.id as journal_id',
			'j.description as journal_description',
			'j.date as journal_date',
			'l.id as ledger_id',
			'l.account_id as ledger_account_id',
			'l.amount as ledger_amount',
			'l.side as ledger_side'
		])
		.execute();

	return transformResultToGetJournalEntry(values);

}

export async function getAllLedgerEntriesForAccount(accountId: number): Promise<GetJournalEntry[]> {
	const values = await db
		.selectFrom('ledger_entry as l')
		.innerJoin('journal_entry as j', 'l.journal_entry_id', 'j.id')
		.where('l.account_id', '=', accountId)
		.select([
			'l.id as ledger_id',
			'l.journal_entry_id as journal_id',
			'j.description as journal_description',
			'j.date as journal_date',
			'l.account_id as ledger_account_id',
			'l.amount as ledger_amount',
			'l.side as ledger_side'
		])
		.orderBy('j.date', 'asc') // Order by journal entry date
		.execute();

	return transformResultToGetJournalEntry(values);
}

function transformResultToGetJournalEntry(
	values: {
		journal_id: number;
		journal_description: string;
		journal_date: Date;
		ledger_id: number;
		ledger_account_id: number;
		ledger_amount: number;
		ledger_side: DebitCredit;
	}[]
) {
	const journalEntriesMap = new Map<number, GetJournalEntry>();

	values.forEach((v) => {
		if (!journalEntriesMap.has(v.journal_id)) {
			journalEntriesMap.set(v.journal_id, {
				id: v.journal_id,
				date: v.journal_date,
				description: v.journal_description,
				ledgerEntries: []
			});
		}

		const journalEntry = journalEntriesMap.get(v.journal_id);
		if (!journalEntry) {
			throw new Error('Could not find journal for ledger entry inside transformation ');
		}

		journalEntriesMap.set(v.journal_id, {
			...journalEntry,
			ledgerEntries: [
				...journalEntry.ledgerEntries,
				{
					account_id: v.ledger_account_id,
					journal_entry_id: v.journal_id,
					amount: v.ledger_amount,
					id: v.ledger_id,
					side: v.ledger_side
				}
			]
		});
	});

	return Array.from(journalEntriesMap.values());
}
