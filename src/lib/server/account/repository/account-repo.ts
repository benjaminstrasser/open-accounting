import { db } from '../../database/database';
import type { Account } from '../../database/database-types';
import { type Insertable, type Selectable, sql, type Updateable } from 'kysely';

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

export async function getAllAccountsWithBalance() {
	return (
		await sql<Selectable<Account> & { balance: string }>`
        SELECT a.id,
               a.account_number,
               a.name,
               a.type,
               a.normal_balance,
               COALESCE(
                       CASE
                           WHEN a.normal_balance = 'debit' THEN
                               SUM(CASE WHEN l.side = 'debit' THEN l.amount ELSE 0 END) -
                               SUM(CASE WHEN l.side = 'credit' THEN l.amount ELSE 0 END)
                           ELSE
                               SUM(CASE WHEN l.side = 'credit' THEN l.amount ELSE 0 END) -
                               SUM(CASE WHEN l.side = 'debit' THEN l.amount ELSE 0 END)
                           END,
                       0
               ) AS balance
        FROM account a
                 LEFT JOIN ledger_entry l ON a.id = l.account_id
        GROUP BY a.id, a.account_number, a.name, a.type, a.normal_balance
        ORDER BY a.account_number;
		`.execute(db)
	).rows;
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
