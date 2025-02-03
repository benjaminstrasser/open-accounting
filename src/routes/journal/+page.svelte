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
	import type { PageProps } from './$types';
	import type { GetJournalEntry } from '$lib/models/ledger.model';
	import Time from 'svelte-time';

	const { data }: PageProps = $props();
	const journalEntries: GetJournalEntry[] = data.journalEntries;
</script>

<div class="container mx-auto space-y-4 p-6">
	<!-- Page Title -->
	<h1 class="text-2xl font-bold text-gray-800">Journal Overview</h1>

	<!-- Journal Entries List -->
	{#each journalEntries as journal}
		<Card class="border border-gray-200 shadow-sm">
			<CardHeader class="bg-gray-50 p-3">
				<!-- Date formatted as "April 14" style -->
				<p class="text-sm font-semibold italic text-gray-600">
					<Time timestamp={journal.date} format="DD MMMM" />
				</p>
			</CardHeader>
			<CardContent class="p-3">
				<Table class="w-full border border-gray-200">
					<TableHeader class="bg-gray-100">
						<TableRow>
							<TableHead class="w-1/4">Account</TableHead>
							<TableHead class="w-1/6 text-center">Reference</TableHead>
							<TableHead class="w-1/4 text-right">Debit (€)</TableHead>
							<TableHead class="w-1/4 text-right">Credit (€)</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each journal.ledgerEntries as entry, index}
							<TableRow class="hover:bg-gray-50">
								<!-- Indent second entry -->
								<TableCell class={index % 2 !== 0 ? 'pl-8 text-sm italic' : 'text-sm font-medium'}>
									{entry.account_id}
								</TableCell>
								<TableCell class="text-center text-sm text-gray-600">
									J{entry.journal_entry_id}
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
				<p class="mt-2 text-sm italic text-gray-600">{journal.description}</p>
			</CardContent>
		</Card>
		<Separator class="my-3" />
	{/each}
</div>
