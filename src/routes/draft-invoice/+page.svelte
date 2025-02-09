<script lang="ts">
	import { filesProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead} from '$lib/components/ui/table';
	import { DraftInvoiceSchema } from '$lib/models/invoice.model';
	import Time from 'svelte-time';

	const {data} = $props()

	const { form, enhance, errors, submit } = superForm(data.form, {
		validators: zodClient(DraftInvoiceSchema)
	})

	const files = filesProxy(form, 'images');

	function submitFiles(e) {
		console.log(e)
		submit(e)
	}

</script>

	<form method="POST" enctype="multipart/form-data" use:enhance>
		<input
			id="draft-files"
			type="file"
			name="images"
			multiple
			accept="application/pdf"
			bind:files={$files}
			onchange={submitFiles}
		/>
		{#if $errors.images}<span>{$errors.images}</span>{/if}
	</form>


<hr class="my-8" />

 Draft Invoices List Table
<h2 class="text-2xl font-bold mb-4">Draft Invoices</h2>
{#if data.drafts && data.drafts.length > 0}
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
					<TableCell>					<Time timestamp={draft.uploaded_at} format="DD.MM.YYYY hh:mm" />
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
{:else}
	<p>No draft invoices found.</p>
{/if}
