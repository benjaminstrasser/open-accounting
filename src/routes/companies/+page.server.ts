import {
	createCompany,
	getClients,
	getYourCompanies
} from '$lib/server/company/service/company-service';
import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { CreateCompanySchema } from '$lib/models/company.model';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(CreateCompanySchema)),
		yourCompanies: await getYourCompanies(),
		clients: await getClients()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(CreateCompanySchema));
		if (!form.valid) return message(form, 'Create Company Form Invalid', { status: 400 });

		try {
			await createCompany(form.data);
		} catch (e: unknown) {
			console.error(e);
			return message(form, 'Error Creating Account', { status: 500 });
		}

		return message(form, 'Account created successful');
	}
};
