<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { CreateJournalWithEntriesSchema } from '$lib/models/ledger.model';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';
	import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date';
	import LedgerEntry from './LedgerEntry.svelte';
	import { type PageData } from './$types';

	const df = new DateFormatter('de-AT', { dateStyle: 'long' });
	let value = today(getLocalTimeZone());

	$: if (value) {
		$formData.journal.date = value.toDate(getLocalTimeZone());
	}

	const items = [{ value: 0, label: 'Today' }];

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(CreateJournalWithEntriesSchema),
		dataType: 'json',
		async onUpdated({ form }) {
			if (form.valid) {
				toast.success('Journal Entry Created!');
				await goto('/journal');
			} else {
				toast.error('Error Creating Journal Entry!');
			}
		}
	});

	const { enhance, form: formData } = form;

	// Calculate totals for each side
	$: debitTotal = $formData.ledgerEntries
		.filter((e) => e.side === 'debit')
		.reduce((sum, e) => sum + (e.amount || 0), 0);

	$: creditTotal = $formData.ledgerEntries
		.filter((e) => e.side === 'credit')
		.reduce((sum, e) => sum + (e.amount || 0), 0);

	$: isBalanced = Math.abs(debitTotal - creditTotal) < 0.01;

	function addLedgerEntry(side: 'debit' | 'credit') {
		$formData.ledgerEntries = [
			...$formData.ledgerEntries,
			{
				account_id: null as unknown as number,
				amount: 0,
				side
			}
		];
	}

	function removeLedgerEntry(index: number) {
		$formData.ledgerEntries = $formData.ledgerEntries.filter((_, i) => i !== index);
	}
</script>

<div class="container mx-auto space-y-2 p-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold text-card-foreground">Create Journal Entry</h1>
		<Button variant="outline" onclick={() => goto('/journal')}>Back to Journals</Button>
	</div>

	<!-- Form Container -->
	<form
		method="POST"
		use:enhance
		class="space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-md"
	>
		<!-- Journal Information -->
		<div class="grid grid-cols-2 gap-4">
			<Form.Field {form} name="journal.date">
				<Form.Control>
					<Form.Label class="text-sm text-muted-foreground">Date</Form.Label>
					<Popover.Root>
						<Popover.Trigger
							class={cn(
								buttonVariants({
									variant: 'outline',
									class: 'w-full justify-start text-left font-normal'
								}),
								!value && 'text-muted-foreground'
							)}
						>
							<CalendarIcon />
							{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
						</Popover.Trigger>
						<Popover.Content
							class="flex w-auto flex-col space-y-2 border border-border bg-card p-2 text-card-foreground"
						>
							<Select.Root
								type="single"
								bind:value={
									() => (value ? df.format(value.toDate(getLocalTimeZone())) : ''),
									(v) => {
										if (!v) return;
										value = today(getLocalTimeZone()).add({ days: Number.parseInt(v) });
									}
								}
							>
								<Select.Trigger class="w-full border border-border bg-card text-card-foreground">
									{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
								</Select.Trigger>
								<Select.Content class="border border-border bg-card text-card-foreground">
									{#each items as item}
										<Select.Item value={`${item.value}`}>{item.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<div class="rounded-md border border-border bg-card">
								<Calendar type="single" bind:value />
							</div>
						</Popover.Content>
					</Popover.Root>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="journal.description">
				<Form.Control>
					<Form.Label class="text-sm text-muted-foreground">Description</Form.Label>
					<Input bind:value={$formData.journal.description} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<!-- Ledger Entries -->
		<div class="mt-6 grid grid-cols-2 gap-6">
			<!-- Debit Column -->
			<div class="rounded-lg border border-border bg-card p-4 text-card-foreground">
				<div class="mb-4 flex items-center justify-between">
					<h4 class="text-lg font-semibold text-green-600">Debit</h4>
					<span class="text-sm font-medium">Total: {debitTotal.toFixed(2)} €</span>
				</div>

				{#each $formData.ledgerEntries
					.map((entry, index) => ({ ...entry, origIndex: index }))
					.filter((e) => e.side === 'debit') as entry}
					<div class="mt-3 flex items-center gap-3">
						<LedgerEntry {form} {entry} {data} {formData} />

						<Form.Field {form} name={`ledgerEntries[${entry.origIndex}].amount`} class="w-32">
							<Form.Control>
								<Input
									type="number"
									min="0"
									step="0.01"
									bind:value={$formData.ledgerEntries[entry.origIndex].amount}
								/>
							</Form.Control>
						</Form.Field>

						<Button
							type="button"
							variant="ghost"
							size="icon"
							onclick={() => removeLedgerEntry(entry.origIndex)}
							class="text-destructive"
						>
							×
						</Button>
					</div>
				{/each}

				<Button
					type="button"
					variant="outline"
					class="mt-4 w-full"
					onclick={() => addLedgerEntry('debit')}
				>
					+ Add Debit Entry
				</Button>
			</div>

			<!-- Credit Column -->
			<div class="rounded-lg border border-border bg-card p-4 text-card-foreground">
				<div class="mb-4 flex items-center justify-between">
					<h4 class="text-lg font-semibold text-red-600">Credit</h4>
					<span class="text-sm font-medium">Total: {creditTotal.toFixed(2)} €</span>
				</div>

				{#each $formData.ledgerEntries
					.map((entry, index) => ({ ...entry, origIndex: index }))
					.filter((e) => e.side === 'credit') as entry}
					<div class="mt-3 flex items-center gap-3">
						<LedgerEntry {form} {entry} {data} {formData} />

						<Form.Field {form} name={`ledgerEntries[${entry.origIndex}].amount`} class="w-32">
							<Form.Control>
								<Input
									type="number"
									min="0"
									step="0.01"
									bind:value={$formData.ledgerEntries[entry.origIndex].amount}
								/>
							</Form.Control>
						</Form.Field>

						<Button
							type="button"
							variant="ghost"
							size="icon"
							onclick={() => removeLedgerEntry(entry.origIndex)}
							class="text-destructive"
						>
							×
						</Button>
					</div>
				{/each}

				<Button
					type="button"
					variant="outline"
					class="mt-4 w-full"
					onclick={() => addLedgerEntry('credit')}
				>
					+ Add Credit Entry
				</Button>
			</div>
		</div>

		<!-- Balance Status -->
		<div class="mt-4 text-center">
			<p class={`${isBalanced ? 'text-green-600' : 'text-red-600'} font-semibold`}>
				{isBalanced ? 'Entries Balanced' : 'Entries Not Balanced'}
			</p>
			<p class="text-sm text-muted-foreground">
				Difference: {Math.abs(debitTotal - creditTotal).toFixed(2)} €
			</p>
		</div>

		<!-- Submit Button -->
		<Button type="submit" class="mt-6 w-full" disabled={!isBalanced}>Submit Journal Entry</Button>
	</form>
</div>
