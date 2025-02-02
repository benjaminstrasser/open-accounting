import type { PageServerLoad } from './$types';
import { getAllAccountsWithBalance } from '$lib/server/account/repository/account-repo';

export const load: PageServerLoad = async () => {
	const accounts = await getAllAccountsWithBalance();

	return {
		accounts
	};
};
