import type { PageServerLoad } from './$types';
import { getAllJournalsWithLedgerEntries } from '$lib/server/ledger/repository/ledger-repo';
import { getAccountsMap } from '$lib/server/account/service/account-service';

export const load: PageServerLoad = async () => {
	return {
		journalEntries: await getAllJournalsWithLedgerEntries(),
		accountsMap: await getAccountsMap()
	};
};
