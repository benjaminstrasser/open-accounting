<script lang="ts">
	import PdfViewer from '$lib/components/pdf-viewer.svelte';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import type { PageProps } from './$types';

	// Expect the page to pass the draft invoice data via load.
	export let data: PageProps;

	const df = new DateFormatter('de-DE', { dateStyle: 'short' });
	const invoice = data.invoice;
</script>

<div class="flex gap-3">
	<!-- Left side: PDF Viewer -->
	<div class="max-h-screen w-1/2 overflow-y-scroll">
		<PdfViewer file_data={invoice.file_data} />
	</div>

	<!-- Right side: Invoice Details -->
	<div class="w-1/2">
		<div
			class="m-auto w-4/5 space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-md"
		>
			<h2 class="mb-4 text-2xl font-bold">Draft Invoice Details</h2>

			<div>
				<p class="font-medium text-muted-foreground">Supplier</p>
				<p>{invoice.supplier}</p>
			</div>

			<div>
				<p class="font-medium text-muted-foreground">Amount</p>
				<p>{invoice.amount.toFixed(2)}</p>
			</div>

			<div>
				<p class="font-medium text-muted-foreground">VAT</p>
				<p>{invoice.vat.toFixed(2)}</p>
			</div>

			<div>
				<p class="font-medium text-muted-foreground">Invoice Date</p>
				<p>{df.format(new Date(invoice.invoice_date))}</p>
			</div>
		</div>
	</div>
</div>
