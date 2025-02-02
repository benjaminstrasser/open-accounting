import type { PageServerLoad } from './$types';
import { getAllAccounts } from '$lib/server/account/repository/account-repo';

export const load: PageServerLoad = async () => {
	const accounts = await getAllAccounts();

	return {
		accounts
	};
};
