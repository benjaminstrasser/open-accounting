import { db } from '../../database/database';
import type { Company } from '$lib/server/database/database-types';
import type { Insertable, Selectable } from 'kysely';

export async function insertCompany(company: Insertable<Company>): Promise<Selectable<Company>> {
	return db.insertInto('company').values(company).returningAll().executeTakeFirstOrThrow();
}

export async function getCompanies(isClient: boolean): Promise<Selectable<Company>[]> {
	return db.selectFrom('company').where('company.is_client', '=', isClient).selectAll().execute();
}
