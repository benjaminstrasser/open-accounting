<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { intProxy, type SuperForm } from 'sveltekit-superforms';
	import type { CreateJournalWithEntries } from '$lib/models/ledger.model';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import { type PageData } from './$types';

	/*	export let form: SuperForm<CreateJournalWithEntries>
	export let entry: {   origIndex: number, account_id: number, amount: number, side: ('debit' | 'credit') }
	export let formData
	export let data*/

	const {
		form,
		entry,
		formData,
		data
	}: {
		form: SuperForm<CreateJournalWithEntries>;
		entry: { origIndex: number; account_id: number; amount: number; side: 'debit' | 'credit' };
		formData: SuperFormData<CreateJournalWithEntries>;
		data: PageData;
	} = $props();

	const accountProxy = intProxy(form, `ledgerEntries[${entry.origIndex}].account_id`);
</script>

<Form.Field {form} name={`ledgerEntries[${entry.origIndex}].account_id`} class="flex-1">
	<Form.Control>
		<Select.Root type="single" bind:value={$accountProxy}>
			<Select.Trigger class="w-full border border-border bg-card text-card-foreground">
				{data.accountsMap[$formData.ledgerEntries[entry.origIndex].account_id]?.name ||
					'Select Account'}
			</Select.Trigger>
			<Select.Content class="border border-border bg-card text-card-foreground">
				{#each Object.values(data.accountsMap) as account}
					<Select.Item value={account.id.toString()}>{account.name}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</Form.Control>
</Form.Field>
