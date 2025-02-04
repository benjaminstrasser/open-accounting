<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Separator } from '$lib/components/ui/separator';
	import type { PageProps } from './$types';
	import Time from 'svelte-time';

	const { data }: PageProps = $props();

	// Placeholder ledger entries (replace with real data later)
	const ledgerEntries = data.ledgerEntries;
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Account Overview Section -->
	<Card class="border border-border shadow-lg bg-card text-card-foreground">
		<CardHeader class="bg-muted p-4">
			<CardTitle class="text-2xl font-semibold text-muted-foreground">
				{data.account.name}
			</CardTitle>
			<p class="text-sm text-muted-foreground">Account Details</p>
		</CardHeader>
		<CardContent class="grid grid-cols-2 gap-6 p-6 text-card-foreground">
			<div>
				<p class="text-sm text-muted-foreground">Account Number</p>
				<p class="text-lg font-medium">{data.account.account_number}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Account Type</p>
				<p class="text-lg font-medium capitalize">{data.account.type}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Normal Balance</p>
				<p class="text-lg font-medium capitalize">{data.account.normal_balance}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Current Balance</p>
				<p class="text-lg font-bold text-green-600">{data.account.balance} €</p>
			</div>
		</CardContent>
	</Card>

	<!-- Separator -->
	<Separator class="my-4" />

	<!-- Ledger Entries Section -->
	<div>
		<h2 class="mb-4 text-xl font-semibold text-foreground">Ledger Entries</h2>

		{#if ledgerEntries.length > 0}
			<Table class="w-full border border-border shadow-md bg-card text-card-foreground">
				<TableHeader class="bg-muted">
					<TableRow>
						<TableHead>Date</TableHead>
						<TableHead>Description</TableHead>
						<TableHead class="text-left">Debit</TableHead>
						<TableHead class="text-left">Credit</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each ledgerEntries as entry}
						<TableRow class="hover:bg-muted">
							<TableCell>
								<Time timestamp={entry.journal_date} format="DD.MM.YYYY" />
							</TableCell>
							<TableCell>{entry.journal_description}</TableCell>
							<TableCell class="font-medium text-green-600">
								{entry.ledger_side === 'debit' ? entry.ledger_amount + ' €' : '-'}
							</TableCell>
							<TableCell class="font-medium text-red-600">
								{entry.ledger_side === 'credit' ? entry.ledger_amount + ' €' : '-'}
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		{:else}
			<p class="py-6 text-center text-muted-foreground">
				No ledger entries found.
			</p>
		{/if}
	</div>
</div>
