<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';
	import type { GetJournalEntry } from '$lib/models/ledger.model';
	import Time from 'svelte-time';
	import { goto } from '$app/navigation';

	const { data }: PageProps = $props();
	const journalEntries: GetJournalEntry[] = data.journalEntries;
	const accountsMap = data.accountsMap;
</script>

<div class="container mx-auto space-y-4 p-6">
	<!-- Page Title -->
	<div class="flex justify-between">
		<h1 class="text-2xl font-bold text-card-foreground">Journal Overview</h1>
		<Button variant="default" href="/journal/create">Create Journal</Button>
	</div>

	<!-- Journal Entries List -->
	{#each journalEntries as journal}
		<Card class="border border-border bg-card text-card-foreground shadow-sm">
			<CardHeader class="bg-muted p-3">
				<!-- Date formatted as "DD.MM.YYYY" -->
				<p class="text-sm font-semibold italic text-muted-foreground">
					<Time timestamp={journal.date} format="DD.MM.YYYY" />
				</p>
			</CardHeader>
			<CardContent class="p-3">
				<Table class="w-full border border-border bg-card text-card-foreground">
					<TableHeader class="bg-muted">
						<TableRow>
							<TableHead class="w-1/4">Account</TableHead>
							<TableHead class="w-1/4 text-right">Debit (€)</TableHead>
							<TableHead class="w-1/4 text-right">Credit (€)</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each journal.ledgerEntries as entry}
							<TableRow class="hover:bg-muted">
								<TableCell
									onclick={() => goto(`/account/${entry.account_id}`)}
									class={entry.side === 'credit'
										? 'cursor-pointer pl-8 text-sm'
										: 'cursor-pointer text-sm'}
								>
									{accountsMap[entry.account_id].account_number} | {accountsMap[entry.account_id]
										.name}
								</TableCell>
								<TableCell class="text-right text-sm font-medium text-green-600">
									{entry.side === 'debit' ? `${entry.amount} €` : '-'}
								</TableCell>
								<TableCell class="text-right text-sm font-medium text-red-600">
									{entry.side === 'credit' ? `${entry.amount} €` : '-'}
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>

				<!-- Description below transactions -->
				<p class="mt-2 text-sm italic text-muted-foreground">{journal.description}</p>
			</CardContent>
		</Card>
		<Separator class="my-3" />
	{/each}
</div>
