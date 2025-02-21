import type { Insertable } from 'kysely';
import { getCompanies, insertCompany } from '../repository/company-repo';
import type { Company } from '$lib/server/database/database-types';

export async function createCompany(input: Insertable<Company>) {
	return insertCompany(input);
}

export async function getYourCompanies() {
	return getCompanies(false);
}

export async function getClients() {
	return getCompanies(true);
}
