<script lang="ts">
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import CirclePlus from 'lucide-svelte/icons/circle-plus';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import type { PageProps } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type AccountWithBalance, CreateAccountSchema } from '$lib/models/account.model';

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
		<h2 class="mb-4 border-b-2 border-primary text-2xl font-semibold">{title}</h2>
		<Table class="w-full shadow-md">
			<TableHeader>
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
						class="cursor-pointer hover:bg-gray-100"
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
		<h1 class="text-3xl font-bold">Accounts Overview</h1>
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				<div class="flex">Create Account
					<CirclePlus class="ml-2"></CirclePlus>
				</div>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Creat Account</Dialog.Title>
					<Dialog.Description>
						Create a debit or credit account
					</Dialog.Description>
					<form method="POST" use:enhance>
						<Form.Field {form} name="account_number">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Account Number</Form.Label>
									<Input {...props} bind:value={$formData.account_number} />
								{/snippet}
							</Form.Control>
							<Form.Description>The account number</Form.Description>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="name">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Name</Form.Label>
									<Input {...props} bind:value={$formData.name} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="type">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Type</Form.Label>
									<Select.Root
										type="single"
										bind:value={$formData.type}
										name={props.name}
									>
										<Select.Trigger>
											{$formData.type
												? $formData.type
												: "Select a account type"}
										</Select.Trigger>
										<Select.Content>
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
									<Form.Label>Normal Balance</Form.Label>
									<Select.Root
										type="single"
										bind:value={$formData.normal_balance}
										name={props.name}
									>
										<Select.Trigger>
											{$formData.normal_balance
												? $formData.normal_balance
												: "Select credit or debit"}
										</Select.Trigger>
										<Select.Content>
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
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<!-- Split View: Debit on Left, Credit on Right, with Vertical Separator -->
	<div class="flex gap-6">
		{@render accountTable('Debit Accounts', debitAccounts)}

		<!-- Vertical Separator (full height) -->
		<div class="w-[2px] bg-primary"></div>

		{@render accountTable('Credit Accounts', creditAccounts)}
	</div>
</div>
