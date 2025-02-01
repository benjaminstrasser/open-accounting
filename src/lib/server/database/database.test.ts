import { expect, test } from 'vitest';
import { db } from '$lib/server/database/database';
import { CompiledQuery } from 'kysely';

test('databse should connect', async () => {
	const { rows } = await db.executeQuery<{ result: 1 }>(
		CompiledQuery.raw('select 1 as result', [])
	);

	expect(rows.length == 1);
	expect(rows[0].result == 1);
});
