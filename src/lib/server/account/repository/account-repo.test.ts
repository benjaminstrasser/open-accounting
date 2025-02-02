import { beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../utils/test/database-reset';
import {
	createAccount,
	deleteAccount,
	getAccountByNumber,
	getAllAccounts,
	getAllAccountsWithBalance,
	updateAccount
} from './account-repo';
import type { Insertable } from 'kysely';
import type { Account } from '../../database/database-types';
import { db } from '$lib/server/database/database';
import { createJournalEntry } from '$lib/server/ledger/repository/ledger-repo';

describe('Account Repository - Edge Cases', () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	it('should create and retrieve an account by account number', async () => {
		const account: Insertable<Account> = {
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		};

		const createdAccount = await createAccount(account);
		expect(createdAccount).toBeDefined();
		expect(createdAccount.account_number).toBe('1000');

		const retrievedAccount = await getAccountByNumber('1000');
		expect(retrievedAccount).toBeDefined();
		expect(retrievedAccount.name).toBe('Cash');
	});

	it('should throw an error when creating an account with a duplicate account number', async () => {
		await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		await expect(
			createAccount({
				account_number: '1000',
				name: 'Duplicate Cash',
				type: 'asset',
				normal_balance: 'debit'
			})
		).rejects.toThrowError();
	});

	it('should retrieve all accounts', async () => {
		await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});
		await createAccount({
			account_number: '2000',
			name: 'Accounts Receivable',
			type: 'asset',
			normal_balance: 'debit'
		});

		const accounts = await getAllAccounts();
		expect(accounts.length).toBe(2);
	});

	it('should throw an error when creating an account with an invalid normal_balance', async () => {
		await expect(
			createAccount({
				account_number: '3000',
				name: 'Invalid Account',
				type: 'asset',
				// @ts-expect-error normal balance should be credit or debit
				normal_balance: 'invalid_balance'
			})
		).rejects.toThrowError();
	});

	it('should throw an error when creating an account with a missing field', async () => {
		await expect(
			// @ts-expect-error Missing account_number
			createAccount({
				name: 'Missing Account',
				type: 'asset',
				normal_balance: 'debit'
			})
		).rejects.toThrowError();
	});

	it('should update an account', async () => {
		const createdAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		const updatedAccount = await updateAccount(createdAccount.id, { name: 'Updated Cash' });
		expect(updatedAccount).toBeDefined();
		expect(updatedAccount?.name).toBe('Updated Cash');
	});

	it('should not update an account with an invalid normal balance', async () => {
		const createdAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		await expect(
			updateAccount(createdAccount.id, {
				// @ts-expect-error normal balance should be credit or debit
				normal_balance: 'invalid_type'
			})
		).rejects.toThrowError();
	});

	it('should delete an account', async () => {
		const createdAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		await deleteAccount(createdAccount.id);

		await expect(getAccountByNumber('1000')).rejects.toThrowError();
	});

	it('should not delete an account referenced in the ledger', async () => {
		const createdAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Insert a journal entry
		const journalEntry = await db
			.insertInto('journal_entry')
			.values({ description: 'Test Entry' })
			.returningAll()
			.executeTakeFirstOrThrow();

		// Insert a ledger entry referencing the account

		await db.transaction().execute(async (tx) => {
			await tx
				.insertInto('ledger_entry')
				.values({
					journal_entry_id: journalEntry.id,
					account_id: createdAccount.id,
					amount: 10000,
					side: 'debit'
				})
				.executeTakeFirstOrThrow();

			await tx
				.insertInto('ledger_entry')
				.values({
					journal_entry_id: journalEntry.id,
					account_id: createdAccount.id,
					amount: 10000,
					side: 'credit'
				})
				.executeTakeFirstOrThrow();
		});

		// Try deleting the referenced account
		await expect(deleteAccount(createdAccount.id)).rejects.toThrowError();
	});

	it('should throw an error when retrieving a non-existent account', async () => {
		await expect(getAccountByNumber('9999')).rejects.toThrowError();
	});

	it('should prevent updating account_number to an already existing one', async () => {
		await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});
		const secondAccount = await createAccount({
			account_number: '2000',
			name: 'Bank',
			type: 'asset',
			normal_balance: 'debit'
		});

		await expect(
			updateAccount(secondAccount.id, { account_number: '1000' })
		).rejects.toThrowError();
	});

	it('should retrieve all accounts with correct balances', async () => {
		// Create accounts
		const account1 = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});
		const account2 = await createAccount({
			account_number: '2000',
			name: 'Accounts Payable',
			type: 'liability',
			normal_balance: 'credit'
		});

		// Create balanced journal entry
		await createJournalEntry({
			journal: { description: 'Test Journal', date: new Date() },
			ledgerEntries: [
				{ account_id: account1.id, amount: 5000, side: 'debit' },
				{ account_id: account2.id, amount: 5000, side: 'credit' }
			]
		});

		// Retrieve accounts with balances
		const accountsWithBalance = await getAllAccountsWithBalance();
		expect(accountsWithBalance.find((a) => a.id === account1.id)?.balance).toBe('5000');
		expect(accountsWithBalance.find((a) => a.id === account2.id)?.balance).toBe('5000');
	});

	it('should return zero balance for accounts with no transactions', async () => {
		// Create an account without any transactions
		const account = await createAccount({
			account_number: '3000',
			name: 'Empty Account',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Retrieve accounts with balances
		const accountsWithBalance = await getAllAccountsWithBalance();
		expect(accountsWithBalance.find((a) => a.id === account.id)?.balance).toBe('0');
	});

	it('should correctly calculate multiple transactions for the same account', async () => {
		// Create accounts
		const account = await createAccount({
			account_number: '4000',
			name: 'Revenue',
			type: 'revenue',
			normal_balance: 'credit'
		});
		const offsetAccount = await createAccount({
			account_number: '5000',
			name: 'Offset Account',
			type: 'expense',
			normal_balance: 'debit'
		});

		// Create balanced journal entries affecting the same account
		await createJournalEntry({
			journal: { description: 'Journal 1', date: new Date() },
			ledgerEntries: [
				{ account_id: account.id, amount: 10000, side: 'credit' },
				{ account_id: offsetAccount.id, amount: 10000, side: 'debit' }
			]
		});

		await createJournalEntry({
			journal: { description: 'Journal 2', date: new Date() },
			ledgerEntries: [
				{ account_id: account.id, amount: 4000, side: 'debit' },
				{ account_id: offsetAccount.id, amount: 4000, side: 'credit' }
			]
		});

		await createJournalEntry({
			journal: { description: 'Journal 3', date: new Date() },
			ledgerEntries: [
				{ account_id: account.id, amount: 2000, side: 'credit' },
				{ account_id: offsetAccount.id, amount: 2000, side: 'debit' }
			]
		});

		// Retrieve accounts with balances
		const accountsWithBalance = await getAllAccountsWithBalance();
		expect(accountsWithBalance.find((a) => a.id === account.id)?.balance).toBe('8000');
		expect(accountsWithBalance.find((a) => a.id === offsetAccount.id)?.balance).toBe('8000');
	});

	it('should fail when creating an unbalanced journal entry', async () => {
		// Create accounts
		const account1 = await createAccount({
			account_number: '6000',
			name: 'Invalid Entry',
			type: 'asset',
			normal_balance: 'debit'
		});
		const account2 = await createAccount({
			account_number: '7000',
			name: 'Another Account',
			type: 'liability',
			normal_balance: 'credit'
		});

		// Attempt to create an unbalanced journal entry
		await expect(
			createJournalEntry({
				journal: { description: 'Unbalanced Entry', date: new Date() },
				ledgerEntries: [
					{ account_id: account1.id, amount: 5000, side: 'debit' },
					{ account_id: account2.id, amount: 4000, side: 'credit' } // Should fail, imbalance of 1000
				]
			})
		).rejects.toThrowError();
	});

	it('should increase balance when a credit account is credited', async () => {
		// Create accounts
		const creditAccount = await createAccount({
			account_number: '8000',
			name: 'Sales Revenue',
			type: 'revenue',
			normal_balance: 'credit'
		});
		const debitAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Record a single transaction
		await createJournalEntry({
			journal: { description: 'Revenue Earned', date: new Date() },
			ledgerEntries: [
				{ account_id: debitAccount.id, amount: 5000, side: 'debit' },
				{ account_id: creditAccount.id, amount: 5000, side: 'credit' }
			]
		});

		// Check balances
		const accountsWithBalance = await getAllAccountsWithBalance();
		const creditedAccount = accountsWithBalance.find((a) => a.id === creditAccount.id);
		expect(creditedAccount?.balance).toBe('5000');
	});

	it('should decrease balance when a credit account is debited', async () => {
		// Create accounts
		const creditAccount = await createAccount({
			account_number: '8000',
			name: 'Sales Revenue',
			type: 'revenue',
			normal_balance: 'credit'
		});
		const debitAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});

		// Record a single transaction (revenue refund)
		await createJournalEntry({
			journal: { description: 'Revenue Refund', date: new Date() },
			ledgerEntries: [
				{ account_id: creditAccount.id, amount: 3000, side: 'debit' },
				{ account_id: debitAccount.id, amount: 3000, side: 'credit' }
			]
		});

		// Check balances
		const accountsWithBalance = await getAllAccountsWithBalance();
		const creditedAccount = accountsWithBalance.find((a) => a.id === creditAccount.id);
		expect(creditedAccount?.balance).toBe('-3000');
	});

	it('should decrease balance when a debit account is credited', async () => {
		// Create accounts
		const debitAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});
		const creditAccount = await createAccount({
			account_number: '2000',
			name: 'Accounts Payable',
			type: 'liability',
			normal_balance: 'credit'
		});

		// Record a single transaction (cash withdrawal)
		await createJournalEntry({
			journal: { description: 'Cash Withdrawal', date: new Date() },
			ledgerEntries: [
				{ account_id: debitAccount.id, amount: 4000, side: 'credit' },
				{ account_id: creditAccount.id, amount: 4000, side: 'debit' }
			]
		});

		// Check balances
		const accountsWithBalance = await getAllAccountsWithBalance();
		const debitedAccount = accountsWithBalance.find((a) => a.id === debitAccount.id);
		expect(debitedAccount?.balance).toBe('-4000');
	});

	it('should increase balance when a debit account is debited', async () => {
		// Create accounts
		const debitAccount = await createAccount({
			account_number: '1000',
			name: 'Cash',
			type: 'asset',
			normal_balance: 'debit'
		});
		const creditAccount = await createAccount({
			account_number: '2000',
			name: 'Accounts Payable',
			type: 'liability',
			normal_balance: 'credit'
		});

		// Record a single transaction (received cash payment)
		await createJournalEntry({
			journal: { description: 'Received Cash Payment', date: new Date() },
			ledgerEntries: [
				{ account_id: debitAccount.id, amount: 6000, side: 'debit' },
				{ account_id: creditAccount.id, amount: 6000, side: 'credit' }
			]
		});

		// Check balances
		const accountsWithBalance = await getAllAccountsWithBalance();
		const debitedAccount = accountsWithBalance.find((a) => a.id === debitAccount.id);
		expect(debitedAccount?.balance).toBe('6000');
	});
});
