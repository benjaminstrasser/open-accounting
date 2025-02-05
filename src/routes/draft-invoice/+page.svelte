<script lang="ts">
	import { tick } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Label } from '$lib/components/ui/label/index.js';
	// Import shadcn table components.
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';

	import { DraftInvoiceSchema } from '$lib/models/invoice.model';

	// Receive server data (the form and a list of draft invoices)
	const { data } = $props();

	// Set up Superforms using the schema and the initial form data.
	const { form, enhance, errors } = superForm(data.form, {
		validators: zodClient(DraftInvoiceSchema)
	});

	let formEl: HTMLFormElement;

	// When files are selected, update the form field "images" and auto-submit.
	async function handleFileInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		// Update the form field with an array of selected files.
		$form.images = Array.from(input.files ?? []);
		await tick();
		formEl.requestSubmit();
	}
</script>

<!-- Upload Form -->
<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance
	bind:this={formEl}
>
	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="draft-files">Upload Draft Invoices (PDF files)</Label>
		<!-- Native input element for file uploads -->
		<input
			id="draft-files"
			type="file"
			name="images"
			accept=".pdf"
			multiple
			oninput={handleFileInput}
			class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
		/>
		{#if $errors.images}
			<p class="text-red-500 text-sm">{$errors.images._errors}</p>
		{/if}
	</div>
</form>

<hr class="my-8" />

<!-- Draft Invoices List Table -->
<h2 class="text-2xl font-bold mb-4">Draft Invoices</h2>
{#if data.drafts.length > 0}
	<Table class="w-full shadow-md bg-card text-card-foreground border border-border">
		<TableHeader class="bg-muted">
			<TableRow>
				<TableHead>ID</TableHead>
				<TableHead>Filename</TableHead>
				<TableHead>Uploaded At</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each data.drafts as draft}
				<TableRow>
					<TableCell>{draft.id}</TableCell>
					<TableCell>{draft.filename}</TableCell>
					<TableCell>{new Date(draft.uploaded_at).toLocaleString()}</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
{:else}
	<p>No draft invoices found.</p>
{/if}
