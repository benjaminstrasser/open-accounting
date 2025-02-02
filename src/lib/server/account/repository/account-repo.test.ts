import { beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../utils/test/database-reset';
import {
	createAccount,
	deleteAccount,
	getAccountByNumber,
	getAllAccounts,
	updateAccount
} from './account-repo';
import type { Insertable } from 'kysely';
import type { Account } from '../../database/database-types';
import { db } from '$lib/server/database/database';

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
});
