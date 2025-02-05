<script lang="ts">
	import { tick } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Label } from '$lib/components/ui/label/index.js';
	import { DraftInvoiceSchema } from '$lib/models/invoice.model';


	// Initialize the form data with an empty array.
	const initialData = { images: [] };

	// Set up Superforms with the schema and initial data.
	const { form, enhance, errors } = superForm(initialData, {
		validators: zodClient(DraftInvoiceSchema)
	});

	let formEl: HTMLFormElement;

	// This handler updates the form field with all selected files and auto-submits.
	async function handleFileInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		// Update the form field "images" with an array of selected files.
		$form.images = Array.from(input.files ?? []);
		// Wait one tick to ensure the reactive update has propagated.
		await tick();
		// Automatically submit the form.
		formEl.requestSubmit();
	}
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance
	bind:this={formEl}
>
	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="draft-files">Upload Draft Invoices (PDF files)</Label>
		<!-- Use a native input element with on:input handler as per official docs -->
		<input
			id="draft-files"
			type="file"
			name="images"
			accept=".pdf"
			multiple
			on:input={handleFileInput}
			class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
		/>
		{#if $errors.images}
			<p class="text-red-500 text-sm">{$errors.images._errors}</p>
		{/if}
	</div>
</form>
