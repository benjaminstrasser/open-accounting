<script lang="ts">
	import * as pdfjs from 'pdfjs-dist';
	// eslint-disable-next-line
	import * as worker from 'pdfjs-dist/build/pdf.worker.mjs';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	let pdfproxy: pdfjs.PDFDocumentProxy = $state(undefined);

	pdfjs.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.mjs`; // Using DocumentInitParameters object to load binary data.

	$effect(() => {
		console.log('loading');
		var loadingTask = pdfjs.getDocument({ data: atob(data.draftInvoice.file_data) });
		console.log(loadingTask);
		loadingTask.promise.then(
			function (pdf) {
				pdfproxy = pdf;
				console.log('PDF loaded'); // Fetch the first page
				for (let i = 1; pdf.numPages >= i; i++) {
					renderPage(i);
				}
			},
			function (reason) {
				// PDF loading error
				console.error(reason);
			}
		);
	});

	function renderPage(pageNumber: number) {
		pdfproxy.getPage(pageNumber).then(function (page) {
			console.log('Page loaded');

			var scale = 2;
			var viewport = page.getViewport({ scale: scale }); // Prepare canvas using PDF page dimensions

			var canvas = document.getElementById(`canvas-${pageNumber}`) as HTMLCanvasElement;
			var context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width; // Render PDF page into canvas context

			var renderContext = {
				canvasContext: context,
				viewport: viewport
			};
			var renderTask = page.render(renderContext);
			renderTask.promise.then(function () {
				console.log('Page rendered');
			});
		});
	}
</script>

<div class="max-h-screen w-1/2 overflow-y-scroll">
	{#if pdfproxy}
		<div class="flex flex-col gap-3">
			{#each Array.from({ length: pdfproxy.numPages }, (_, i) => i + 1) as page}
				<canvas id={`canvas-${page}`}></canvas>
			{/each}
		</div>
	{/if}
</div>
