import type { PageServerLoad } from './$types';
import { getAccountByIdWithBalance } from '$lib/server/account/repository/account-repo';
import { getAllLedgerEntriesForAccount } from '$lib/server/ledger/repository/ledger-repo';

export const load: PageServerLoad = async ({ params }) => {
	// TODO error handling
	const id = Number.parseInt(params.accountid);

	return {
		account: await getAccountByIdWithBalance(id),
		ledgerEntries: await getAllLedgerEntriesForAccount(id)
	};
};
