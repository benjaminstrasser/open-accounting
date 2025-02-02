import { beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../utils/test/database-reset';
import {
	createJournalEntry,
	getAllJournalsWithLedgerEntries,
	getJournalEntryWithLedgerById
} from './ledger-repo';
import { db } from '$lib/server/database/database';

describe('Ledger Repository - Journal & Ledger Entries', () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	it('should create a journal entry with associated ledger entries', async () => {
		// Create accounts and get their IDs
		const [account1, account2] = await db
			.insertInto('account')
			.values([
				{ account_number: '1000', name: 'Cash', type: 'asset', normal_balance: 'debit' },
				{ account_number: '2000', name: 'Bank', type: 'asset', normal_balance: 'credit' }
			])
			.returning(['id'])
			.execute();

		// Create journal entry
		const createdJournal = await createJournalEntry({
			journal: { description: 'Test Journal', date: new Date() },
			ledgerEntries: [
				{ account_id: account1.id, amount: 5000, side: 'debit' },
				{ account_id: account2.id, amount: 5000, side: 'credit' }
			]
		});

		expect(createdJournal).toBeDefined();
		expect(createdJournal.description).toBe('Test Journal');
	});

	it('should retrieve a journal entry with its ledger entries', async () => {
		// Create accounts and get their IDs
		const [account1, account2] = await db
			.insertInto('account')
			.values([
				{ account_number: '1000', name: 'Cash', type: 'asset', normal_balance: 'debit' },
				{ account_number: '2000', name: 'Bank', type: 'asset', normal_balance: 'credit' }
			])
			.returning(['id'])
			.execute();

		// Create journal entry
		const createdJournal = await createJournalEntry({
			journal: { description: 'Test Journal', date: new Date() },
			ledgerEntries: [
				{ account_id: account1.id, amount: 5000, side: 'debit' },
				{ account_id: account2.id, amount: 5000, side: 'credit' }
			]
		});

		// Fetch the journal entry with its ledger entries
		const fetchedJournal = await getJournalEntryWithLedgerById(createdJournal.id);

		expect(fetchedJournal).toBeDefined();
		expect(fetchedJournal.description).toBe('Test Journal');
		expect(fetchedJournal.ledgerEntries.length).toBe(2);
	});

	it('should retrieve all journal entries with ledger entries', async () => {
		// Create accounts and get their IDs
		const [account1, account2, account3, account4] = await db
			.insertInto('account')
			.values([
				{ account_number: '1000', name: 'Cash', type: 'asset', normal_balance: 'debit' },
				{ account_number: '2000', name: 'Bank', type: 'asset', normal_balance: 'credit' },
				{ account_number: '3000', name: 'Revenue', type: 'revenue', normal_balance: 'credit' },
				{ account_number: '4000', name: 'Expense', type: 'expense', normal_balance: 'debit' }
			])
			.returning(['id'])
			.execute();

		// Create journal entries
		await createJournalEntry({
			journal: { description: 'Journal 1', date: new Date() },
			ledgerEntries: [
				{ account_id: account1.id, amount: 3000, side: 'debit' },
				{ account_id: account2.id, amount: 3000, side: 'credit' }
			]
		});

		await createJournalEntry({
			journal: { description: 'Journal 2', date: new Date() },
			ledgerEntries: [
				{ account_id: account3.id, amount: 7000, side: 'debit' },
				{ account_id: account4.id, amount: 7000, side: 'credit' }
			]
		});

		// Fetch all journal entries
		const allJournals = await getAllJournalsWithLedgerEntries();
		expect(allJournals.length).toBe(2);
		expect(allJournals[0].ledgerEntries.length).toBe(2);
		expect(allJournals[1].ledgerEntries.length).toBe(2);
	});

	it('should throw an error when creating an unbalanced journal entry', async () => {
		// Create accounts and get their IDs
		const [account1, account2] = await db
			.insertInto('account')
			.values([
				{ account_number: '1000', name: 'Cash', type: 'asset', normal_balance: 'debit' },
				{ account_number: '2000', name: 'Bank', type: 'asset', normal_balance: 'credit' }
			])
			.returning(['id'])
			.execute();

		// Attempt to create an unbalanced journal entry
		await expect(
			createJournalEntry({
				journal: { description: 'Unbalanced Journal', date: new Date() },
				ledgerEntries: [
					{ account_id: account1.id, amount: 5000, side: 'debit' },
					{ account_id: account2.id, amount: 4000, side: 'credit' } // Unbalanced!
				]
			})
		).rejects.toThrowError();
	});

	it('should throw an error when referencing a non-existent account in ledger entries', async () => {
		// Attempt to create a journal entry referencing an invalid account ID
		await expect(
			createJournalEntry({
				journal: { description: 'Invalid Account Journal', date: new Date() },
				ledgerEntries: [
					{ account_id: 9999, amount: 5000, side: 'debit' }, // Non-existent account
					{ account_id: 1000, amount: 5000, side: 'credit' }
				]
			})
		).rejects.toThrowError();
	});

	it('should allow creating multiple journal entries on the same day', async () => {
		// Create accounts first
		const [account1, account2] = await db
			.insertInto('account')
			.values([
				{ account_number: '1000', name: 'Cash', type: 'asset', normal_balance: 'debit' },
				{ account_number: '2000', name: 'Bank', type: 'asset', normal_balance: 'credit' }
			])
			.returning(['id'])
			.execute();

		// Create two journal entries on the same date
		const date = new Date();
		await createJournalEntry({
			journal: { description: 'Journal Entry 1', date },
			ledgerEntries: [
				{ account_id: account1.id, amount: 2000, side: 'debit' },
				{ account_id: account2.id, amount: 2000, side: 'credit' }
			]
		});

		await createJournalEntry({
			journal: { description: 'Journal Entry 2', date },
			ledgerEntries: [
				{ account_id: account1.id, amount: 3000, side: 'debit' },
				{ account_id: account2.id, amount: 3000, side: 'credit' }
			]
		});

		// Verify both entries exist
		const allJournals = await getAllJournalsWithLedgerEntries();
		expect(allJournals.length).toBe(2);
	});

	it('should allow deletion of a journal entry after removing its ledger entries', async () => {
		// Create accounts
		const [account1, account2] = await db
			.insertInto('account')
			.values([
				{ account_number: '1000', name: 'Cash', type: 'asset', normal_balance: 'debit' },
				{ account_number: '2000', name: 'Bank', type: 'asset', normal_balance: 'credit' }
			])
			.returning(['id'])
			.execute();

		// Create journal entry
		const createdJournal = await createJournalEntry({
			journal: { description: 'Deletable Journal Entry', date: new Date() },
			ledgerEntries: [
				{ account_id: account1.id, amount: 5000, side: 'debit' },
				{ account_id: account2.id, amount: 5000, side: 'credit' }
			]
		});

		// Remove all ledger entries
		await db.deleteFrom('ledger_entry').where('journal_entry_id', '=', createdJournal.id).execute();

		// Now delete the journal entry
		await db.deleteFrom('journal_entry').where('id', '=', createdJournal.id).execute();

		// Verify deletion
		const fetchedJournal = await db
			.selectFrom('journal_entry')
			.where('id', '=', createdJournal.id)
			.selectAll()
			.executeTakeFirst();
		expect(fetchedJournal).toBeUndefined();
	});
});
