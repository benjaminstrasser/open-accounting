<script lang="ts">
	import '../app.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { Toaster } from 'svelte-sonner';


	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="h-100 w-full overflow-y-auto">
		<Sidebar.Trigger />
		{@render children?.()}
		<Toaster />
	</main>
</Sidebar.Provider>
