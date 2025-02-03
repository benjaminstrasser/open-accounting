import type { PageServerLoad } from './$types';
import { getAccountByIdWithBalance } from '$lib/server/account/repository/account-repo';

export const load: PageServerLoad = async ({ params }) => {
	// TODO error handling
	const id = Number.parseInt(params.accountid);

	return {
		account: await getAccountByIdWithBalance(id)
	};
};
