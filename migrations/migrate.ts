import * as path from 'path';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely';
import type { DB } from '../src/lib/server/database/database-types';
import { config } from 'dotenv';

config();

async function migrateToLatest() {
	const db = new Kysely<DB>({
		dialect: new PostgresDialect({
			pool: new Pool({
				host: process.env.DATABASE_HOST,
				database: process.env.DATABASE_DB,
				user: process.env.DATABASE_USER,
				password: process.env.DATABASE_PASSWORD,
				port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : undefined
			})
		})
	});

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			// This needs to be an absolute path.
			migrationFolder: path.join(__dirname, 'migrations')
		})
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === 'Error') {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error('failed to migrate');
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
}

migrateToLatest();
