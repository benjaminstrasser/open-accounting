<script lang="ts">
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	// Split accounts into debit and credit
	const debitAccounts = data.accounts.filter(account => account.normal_balance === 'debit');
	const creditAccounts = data.accounts.filter(account => account.normal_balance === 'credit');
</script>

<!-- Snippet for account table -->
{#snippet accountTable(title, accounts)}
	<div class="flex-1 ">
		<h2 class="text-2xl font-semibold mb-4 border-b-2 border-primary">{title}</h2>
		<Table class="shadow-md w-full">
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
					<TableRow class="cursor-pointer hover:bg-gray-100" on:click={() => goto(`/account/${account.id}`)}>
						<TableCell>{account.account_number}</TableCell>
						<TableCell>{account.name}</TableCell>
						<TableCell class="capitalize">{account.type}</TableCell>
						<TableCell class="font-bold">{account.balance}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
{/snippet}

<div class="container mx-auto p-6">
	<!-- Page Header -->
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">Accounts Overview</h1>
	</div>

	<!-- Split View: Debit on Left, Credit on Right, with Vertical Separator -->
	<div class="flex gap-6">
		{@render accountTable("Debit Accounts", debitAccounts)}

		<!-- Vertical Separator (full height) -->
		<div class="w-[2px] bg-primary"></div>

		{@render accountTable("Credit Accounts", creditAccounts)}
	</div>
</div>
