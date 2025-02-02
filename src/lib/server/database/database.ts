import type { DB } from './database-types';
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import {
	DATABASE_DB,
	DATABASE_HOST,
	DATABASE_PASSWORD,
	DATABASE_PORT,
	DATABASE_USER
} from '$env/static/private';

const dialect = new PostgresDialect({
	pool: new pg.Pool({
		database: DATABASE_DB,
		host: DATABASE_HOST,
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		port: Number.parseInt(DATABASE_PORT),
		max: 10
	})
});

export const db = new Kysely<DB>({
	dialect
});
