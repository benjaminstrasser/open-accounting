import { z } from 'zod';
import type { Account } from '$lib/server/database/database-types';
import type { Selectable } from 'kysely';

export const CreateAccountSchema = z.object({
	account_number: z.string().min(1).max(10),
	name: z.string(),
	type: z.string(),
	normal_balance: z.enum(['debit', 'credit'])
});

export type CreateAccount = z.infer<typeof CreateAccountSchema>;

export type AccountWithBalance = Selectable<Account> & { balance: number };
