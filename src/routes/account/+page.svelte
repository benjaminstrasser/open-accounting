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
	import CirclePlus from 'lucide-svelte/icons/circle-plus';
	import { Separator } from "$lib/components/ui/separator";
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
</script>

<!-- Snippet for account table -->
{#snippet accountTable(title: string, accounts: AccountWithBalance[])}
	<div class="flex-1">
		<h2 class=" text-xl font-semibold text-card-foreground">
			{title}
		</h2>
		<Separator class="mb-4"/>
		<Table class="w-full shadow-md bg-card text-card-foreground border border-border">
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
			<Dialog.Content class="bg-card text-card-foreground border border-border shadow-lg p-6">
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
									<Select.Trigger class="bg-card text-card-foreground border border-border">
										{$formData.type ? $formData.type : 'Select an account type'}
									</Select.Trigger>
									<Select.Content class="bg-card text-card-foreground border border-border">
										<Select.Item value="asset">Aktivkonto (Asset)</Select.Item>
										<Select.Item value="liability">Passivkonto (Liability)</Select.Item>
										<Select.Item value="equity">Eigenkapital (Equity)</Select.Item>
										<Select.Item value="revenue">Ertragskonto (Revenue)</Select.Item>
										<Select.Item value="expense">Aufwandskonto (Expense)</Select.Item>
										<Select.Item value="private">Privatkonto (Private)</Select.Item>
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
								<Select.Root
									type="single"
									bind:value={$formData.normal_balance}
									name={props.name}
								>
									<Select.Trigger class="bg-card text-card-foreground border border-border">
										{$formData.normal_balance
											? $formData.normal_balance
											: 'Select credit or debit'}
									</Select.Trigger>
									<Select.Content class="bg-card text-card-foreground border border-border">
										<Select.Item value="debit">Debit</Select.Item>
										<Select.Item value="credit">Credit</Select.Item>
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
		<Separator orientation="vertical"/>
		{@render accountTable('Credit Accounts', creditAccounts)}
	</div>
</div>
