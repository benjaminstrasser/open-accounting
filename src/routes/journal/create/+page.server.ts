import type { PageServerLoad } from './$types';
import { getAccountsMap } from '$lib/server/account/service/account-service';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { CreateJournalWithEntriesSchema } from '$lib/models/ledger.model';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(CreateJournalWithEntriesSchema)),
		accountsMap: await getAccountsMap()
	};
};
