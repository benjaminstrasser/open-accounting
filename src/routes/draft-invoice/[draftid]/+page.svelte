<script lang="ts">
	import type { PageProps } from './$types';
	import PdfViewer from '$lib/components/pdf-viewer.svelte';

	const { data }: PageProps = $props();
</script>

<div class="max-h-screen w-1/2 overflow-y-scroll">
	<PdfViewer file_data={data.draftInvoice.file_data} />
</div>
