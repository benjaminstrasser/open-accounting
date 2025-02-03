import type { PageServerLoad } from './$types';
import { getAccountsMap } from '$lib/server/account/service/account-service';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { CreateJournalWithEntriesSchema } from '$lib/models/ledger.model';
import type { Actions } from './$types';
import { createJournalEntry } from '$lib/server/ledger/repository/ledger-repo';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(CreateJournalWithEntriesSchema)),
		accountsMap: await getAccountsMap()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(CreateJournalWithEntriesSchema));
		if (!form.valid) {
			return message(form, 'Form Invalid', { status: 400 });
		}

		try {
			await createJournalEntry(form.data);
		} catch (e: unknown) {
			console.error(e);
			return message(form, 'Error Creating Journal Entry', { status: 500 });
		}

		return message(form, 'Journal Entry created successful');
	}
};
