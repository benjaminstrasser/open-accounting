import { z } from 'zod';

export const CreateAccountSchema = z.object({
	account_number: z.string().min(1).max(10),
	name: z.string(),
	type: z.string(),
	normal_balance: z.enum(['debit', 'credit'])
});

export type CreateAccount = z.infer<typeof CreateAccountSchema>;
