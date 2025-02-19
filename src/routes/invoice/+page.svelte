<script lang="ts">
	import {
		Table,
		TableHeader,
		TableRow,
		TableBody,
		TableCell,
		TableHead
	} from '$lib/components/ui/table';
	import Time from 'svelte-time';
	import { goto } from '$app/navigation';

	export let data;
</script>

<h2 class="mb-4 text-2xl font-bold">Invoices</h2>

{#if data.invoices && data.invoices.length > 0}
	<Table class="w-full border border-border bg-card text-card-foreground shadow-md">
		<TableHeader class="bg-muted">
			<TableRow>
				<TableHead>Supplier</TableHead>
				<TableHead>Amount</TableHead>
				<TableHead>VAT</TableHead>
				<TableHead>Invoice Date</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each data.invoices as invoice}
				<TableRow class="cursor-pointer" onclick={() => goto(`/invoice/${invoice.id}`)}>
					<TableCell>{invoice.supplier}</TableCell>
					<TableCell>{invoice.amount.toFixed(2)}</TableCell>
					<TableCell>{invoice.vat.toFixed(2)}</TableCell>
					<TableCell>
						<Time timestamp={invoice.invoice_date} format="DD.MM.YYYY" />
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
{:else}
	<p>No invoices found.</p>
{/if}
