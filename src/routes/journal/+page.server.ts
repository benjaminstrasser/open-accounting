import type { PageServerLoad } from './$types';
import {
	getAllJournalsWithLedgerEntries,
} from '$lib/server/ledger/repository/ledger-repo';

export const load: PageServerLoad = async ( ) => {
	return {
		journalEntries: await getAllJournalsWithLedgerEntries()
	};
};
