import type { Actions, PageServerLoad } from './$types';
import {
	createAccount,
	getAllAccountsWithBalance
} from '$lib/server/account/repository/account-repo';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { CreateAccountSchema } from '$lib/models/account.model';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(CreateAccountSchema)),
		accounts: await getAllAccountsWithBalance()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(CreateAccountSchema));
		if (!form.valid) {
			return message(form, 'Form Invalid', { status: 400 });
		}

		try {
			await createAccount(form.data);
		} catch (e: unknown) {
			console.error(e);
			return message(form, 'Error Creating Account', { status: 500 });
		}

		return message(form, 'Account created successful');
	}
};
