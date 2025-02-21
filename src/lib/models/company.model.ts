import type { Company } from '$lib/server/database/database-types';
import type { Selectable } from 'kysely';
import { z } from 'zod';

export const CreateCompanySchema = z.object({
	name: z.string().min(1, 'Name is required').max(50),
	street: z.string().min(1, 'Street is required').max(100),
	zip_code: z.string().min(1, 'Zip code is required').max(10),
	city: z.string().min(1, 'City is required').max(100),
	country: z.string().min(1, 'Country is required').max(50),
	uid: z.string().min(1, 'UID is required').max(30),
	is_client: z.boolean()
});

export type CompanyInput = z.infer<typeof CreateCompanySchema>;

export type CompanyData = Selectable<Company>;
