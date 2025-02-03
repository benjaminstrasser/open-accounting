import { getAllAccounts } from '$lib/server/account/repository/account-repo';
import type { AccountMap } from '$lib/models/account.model';

export async function getAccountsMap():Promise<AccountMap> {
	return (await getAllAccounts()).reduce((aggregator, current)=> {
		aggregator[current.id] = current
		return aggregator;
	}, {} as AccountMap);
}