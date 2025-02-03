import { beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../utils/test/database-reset';
import {
	createJournalEntry,
	getAllJournalEntriesForAccount,
	getAllJournalsWithLedgerEntries,
	getAllLedgerEntriesForAccount,
	getJournalEntryWithLedgerById
} from './ledger-repo';
import { db } from '$lib/server/database/database';
import { createAccount } from '$lib/server/account/repository/account-repo';

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

	it('should return an empty array if no ledger entries exist for the account', async () => {
		const account = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		const result = await getAllJournalEntriesForAccount(account.id);
		expect(result).toEqual([]); // Should return an empty array
	});

	it('should retrieve multiple ledger entries for an account', async () => {
		const account = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Create two journal entries with transactions for the same account
		const journal1 = await createJournalEntry({
			journal: { description: 'First Transaction', date: new Date('2024-02-01') },
			ledgerEntries: [
				{ account_id: account.id, amount: 5000, side: 'debit' },
				{ account_id: account.id, amount: 5000, side: 'credit' }
			]
		});

		const journal2 = await createJournalEntry({
			journal: { description: 'Second Transaction', date: new Date('2024-02-02') },
			ledgerEntries: [
				{ account_id: account.id, amount: 2000, side: 'debit' },
				{ account_id: account.id, amount: 2000, side: 'credit' }
			]
		});

		// Fetch ledger entries
		const result = await getAllJournalEntriesForAccount(account.id);

		// Ensure correct structure
		expect(result.length).toBe(2);
		expect(result[0].id).toBe(journal1.id);
		expect(result[0].ledgerEntries.length).toBe(2);
		expect(result[1].id).toBe(journal2.id);
		expect(result[1].ledgerEntries.length).toBe(2);
	});

	it('should correctly order transactions by journal date', async () => {
		const account = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Create journal entries out of order
		await createJournalEntry({
			journal: { description: 'Later Transaction', date: new Date('2024-02-05') },
			ledgerEntries: [
				{ account_id: account.id, amount: 1000, side: 'debit' },
				{
					account_id: account.id,
					amount: 1000,
					side: 'credit'
				}
			]
		});

		await createJournalEntry({
			journal: { description: 'Earlier Transaction', date: new Date('2024-02-01') },
			ledgerEntries: [
				{ account_id: account.id, amount: 500, side: 'credit' },
				{
					account_id: account.id,
					amount: 500,
					side: 'debit'
				}
			]
		});

		// Fetch ledger entries
		const result = await getAllJournalEntriesForAccount(account.id);

		// Ensure correct order (earliest first)
		expect(result.length).toBe(2);
		expect(result[0].description).toBe('Earlier Transaction');
		expect(result[1].description).toBe('Later Transaction');
	});

	it('should return an empty array if no ledger entries exist for the account', async () => {
		const account = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		const result = await getAllLedgerEntriesForAccount(account.id);
		expect(result).toEqual([]); // Should return an empty array
	});

	it('should retrieve multiple ledger entries for an account', async () => {
		const account = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Create two journal entries with transactions for the same account
		const journal1 = await createJournalEntry({
			journal: { description: 'First Transaction', date: new Date('2024-02-01') },
			ledgerEntries: [
				{ account_id: account.id, amount: 5000, side: 'debit' },
				{ account_id: account.id, amount: 5000, side: 'credit' }
			]
		});

		const journal2 = await createJournalEntry({
			journal: { description: 'Second Transaction', date: new Date('2024-02-02') },
			ledgerEntries: [
				{ account_id: account.id, amount: 2000, side: 'debit' },
				{ account_id: account.id, amount: 2000, side: 'credit' }
			]
		});

		// Fetch ledger entries
		const result = await getAllLedgerEntriesForAccount(account.id);

		// Ensure correct structure
		expect(result.length).toBe(4);
		expect(result[0].journal_id).toBe(journal1.id);
		expect(result[1].journal_id).toBe(journal1.id);
		expect(result[2].journal_id).toBe(journal2.id);
		expect(result[3].journal_id).toBe(journal2.id);
	});

	it('should correctly order transactions by journal date', async () => {
		const account = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		const account2 = await createAccount({
			account_number: '10000',
			name: 'asd',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Create journal entries out of order
		await createJournalEntry({
			journal: { description: 'Later Transaction', date: new Date('2024-02-05') },
			ledgerEntries: [
				{ account_id: account.id, amount: 1000, side: 'debit' },
				{
					account_id: account2.id,
					amount: 1000,
					side: 'credit'
				}
			]
		});

		await createJournalEntry({
			journal: { description: 'Earlier Transaction', date: new Date('2024-02-01') },
			ledgerEntries: [
				{ account_id: account.id, amount: 500, side: 'credit' },
				{
					account_id: account2.id,
					amount: 500,
					side: 'debit'
				}
			]
		});

		// Fetch ledger entries
		const result = await getAllLedgerEntriesForAccount(account.id);

		// Ensure correct order (earliest first)
		expect(result.length).toBe(2);
		expect(result[0].journal_description).toBe('Earlier Transaction');
		expect(result[1].journal_description).toBe('Later Transaction');
	});
});
