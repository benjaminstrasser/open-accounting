<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import type { PageProps } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type AccountWithBalance, CreateAccountSchema } from '$lib/models/account.model';
	import { Button } from '$lib/components/ui/button';

	const { data }: PageProps = $props();

	let open = $state(false);
	// Split accounts into debit and credit
	const debitAccounts = data.accounts.filter((account) => account.normal_balance === 'debit');
	const creditAccounts = data.accounts.filter((account) => account.normal_balance === 'credit');

	const form = superForm(data.form, {
		validators: zodClient(CreateAccountSchema),
		async onUpdated({ form }) {
			if (form.valid) {
				toast.success('Account created!');
				open = false;
				await invalidate('account');
			} else {
				toast.error('Error Creating Account!');
			}
		}
	});
	const { enhance, form: formData } = form;

	// Array for account types
	const accountTypes = [
		{ value: 'asset', label: 'Aktivkonto (Asset)' },
		{ value: 'liability', label: 'Passivkonto (Liability)' },
		{ value: 'equity', label: 'Eigenkapital (Equity)' },
		{ value: 'revenue', label: 'Ertragskonto (Revenue)' },
		{ value: 'expense', label: 'Aufwandskonto (Expense)' },
		{ value: 'private', label: 'Privatkonto (Private)' }
	];

	// Array for normal balances
	const normalBalances = [
		{ value: 'debit', label: 'Debit' },
		{ value: 'credit', label: 'Credit' }
	];
</script>

<!-- Snippet for account table -->
{#snippet accountTable(title: string, accounts: AccountWithBalance[])}
	<div class="flex-1">
		<h2 class=" text-xl font-semibold text-card-foreground">
			{title}
		</h2>
		<Separator class="mb-4" />
		<Table class="w-full border border-border bg-card text-card-foreground shadow-md">
			<TableHeader class="bg-muted">
				<TableRow>
					<TableHead>Number</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Balance</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each accounts as account}
					<TableRow
						class="cursor-pointer hover:bg-muted"
						onclick={() => goto(`/account/${account.id}`)}
					>
						<TableCell>{account.account_number}</TableCell>
						<TableCell>{account.name}</TableCell>
						<TableCell class="capitalize">{account.type}</TableCell>
						{#if account.balance == 0}
							<TableCell>
								{account.balance} €
							</TableCell>
						{:else if (account.normal_balance === 'debit' && account.balance > 0) || (account.normal_balance === 'credit' && account.balance < 0)}
							<TableCell class="text-green-600">
								{account.balance} €
							</TableCell>
						{:else}
							<TableCell class="text-red-600">
								{account.balance} €
							</TableCell>
						{/if}
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
{/snippet}

<div class="container mx-auto p-6">
	<!-- Page Header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-card-foreground">Accounts Overview</h1>
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				<Button variant="default">Create Account</Button>
			</Dialog.Trigger>
			<Dialog.Content class="border border-border bg-card p-6 text-card-foreground shadow-lg">
				<Dialog.Header class="mb-4">
					<Dialog.Title class="text-xl font-semibold">Create Account</Dialog.Title>
					<Dialog.Description class="text-sm text-muted-foreground">
						Create a debit or credit account
					</Dialog.Description>
				</Dialog.Header>
				<form method="POST" use:enhance>
					<Form.Field {form} name="account_number">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Account Number</Form.Label>
								<Input {...props} bind:value={$formData.account_number} />
							{/snippet}
						</Form.Control>
						<Form.Description class="text-xs text-muted-foreground">
							The account number
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Name</Form.Label>
								<Input {...props} bind:value={$formData.name} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="type">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Type</Form.Label>
								<Select.Root type="single" bind:value={$formData.type} name={props.name}>
									<Select.Trigger class="border border-border bg-card text-card-foreground">
										{#if $formData.type}
											{accountTypes.find((item) => item.value === $formData.type)?.label}
										{:else}
											Select an account type
										{/if}
									</Select.Trigger>
									<Select.Content class="border border-border bg-card text-card-foreground">
										{#each accountTypes as accountType}
											<Select.Item value={accountType.value}>
												{accountType.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="normal_balance">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-sm text-muted-foreground">Normal Balance</Form.Label>
								<Select.Root type="single" bind:value={$formData.normal_balance} name={props.name}>
									<Select.Trigger class="border border-border bg-card text-card-foreground">
										{#if $formData.normal_balance}
											{normalBalances.find((item) => item.value === $formData.normal_balance)
												?.label}
										{:else}
											Select credit or debit
										{/if}
									</Select.Trigger>
									<Select.Content class="border border-border bg-card text-card-foreground">
										{#each normalBalances as balance}
											<Select.Item value={balance.value}>
												{balance.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button>Submit</Form.Button>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<!-- Split View: Debit on Left, Credit on Right, with Vertical Separator -->
	<div class="flex gap-6">
		{@render accountTable('Debit Accounts', debitAccounts)}

		<!-- Vertical Separator (full height) -->
		<Separator orientation="vertical" />
		{@render accountTable('Credit Accounts', creditAccounts)}
	</div>
</div>
