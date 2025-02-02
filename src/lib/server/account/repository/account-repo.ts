import { db } from '../../database/database';
import type { Account } from '../../database/database-types';
import type { Insertable, Selectable, Updateable } from 'kysely';

export async function getAccountByNumber(accountNumber: string): Promise<Selectable<Account>> {
	return db
		.selectFrom('account')
		.where('account_number', '=', accountNumber)
		.selectAll()
		.executeTakeFirstOrThrow();
}

export async function getAllAccounts(): Promise<Selectable<Account>[]> {
	return db.selectFrom('account').selectAll().execute();
}

export async function createAccount(account: Insertable<Account>): Promise<Selectable<Account>> {
	return db.insertInto('account').values(account).returningAll().executeTakeFirstOrThrow();
}

export async function updateAccount(
	id: number,
	updateFields: Updateable<Account>
): Promise<Selectable<Account>> {
	return db
		.updateTable('account')
		.set(updateFields)
		.where('id', '=', id)
		.returningAll()
		.executeTakeFirstOrThrow();
}

export async function deleteAccount(id: number): Promise<void> {
	await db.deleteFrom('account').where('id', '=', id).executeTakeFirstOrThrow();
}
