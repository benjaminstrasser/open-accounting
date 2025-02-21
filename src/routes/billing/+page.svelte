<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import {
		TableHeader,
		TableRow,
		TableHead,
		TableBody,
		TableCell,
		Table
	} from '$lib/components/ui/table';
	import type { PageProps } from './$types';
	import { CreateCompanySchema, type CompanyData } from '$lib/models/company.model';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input';

	const { data }: PageProps = $props();

	const form = superForm(data.form, {
		validators: zodClient(CreateCompanySchema),
		async onUpdated({ form }) {
			if (form.valid) {
				toast.success('Company created!');
				open = false;
				console.warn(open);
			} else {
				toast.error('Error Creating Company!');
			}
		}
	});
	const { enhance, form: formData } = form;

	let open = $state(false);

	$formData.is_client = true;
</script>

{#snippet companyTable(title: string, companies: CompanyData[])}
	<div class="flex-1">
		<h2 class=" text-xl font-semibold text-card-foreground">
			{title}
		</h2>
		<Separator class="mb-4" />
		<Table class="w-full border border-border bg-card text-card-foreground shadow-md">
			<TableHeader class="bg-muted">
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Address</TableHead>
					<TableHead>UID</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each companies as company}
					<TableRow class="cursor-pointer hover:bg-muted">
						<TableCell>{company.name}</TableCell>
						<TableCell
							>{company.street}, {company.zip_code} {company.city}, {company.country}</TableCell
						>
						<TableCell>{company.uid}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
{/snippet}

<div class="container mx-auto p-6">
	<!-- Page Header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-card-foreground">Billing</h1>
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				<Button variant="default">Add Company</Button>
			</Dialog.Trigger>
			<Dialog.Content class="border border-border bg-card p-6 text-card-foreground shadow-lg">
				<Dialog.Header class="mb-4">
					<Dialog.Title class="text-xl font-semibold">Create Company</Dialog.Title>
					<Dialog.Description class="text-sm text-muted-foreground">
						Create a new company for one side of the billing process.
					</Dialog.Description>
				</Dialog.Header>
				<form method="POST" use:enhance>
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Company Name</Form.Label>
								<Input {...props} bind:value={$formData.name} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="street">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Street</Form.Label>
								<Input {...props} bind:value={$formData.street} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="zip_code">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Zip Code</Form.Label>
								<Input {...props} bind:value={$formData.zip_code} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="city">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">City</Form.Label>
								<Input {...props} bind:value={$formData.city} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="country">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Country</Form.Label>
								<Input {...props} bind:value={$formData.country} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="uid">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">UID</Form.Label>
								<Input {...props} bind:value={$formData.uid} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button>Submit</Form.Button>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="flex flex-col gap-12">
		{open}
		{@render companyTable('Your Companies', data.yourCompanies)}
		{@render companyTable('Clients', data.clients)}
	</div>
</div>
