<script lang="ts">
	import '../app.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="h-full w-full overflow-y-auto">
		{@render children?.()}
		<Toaster />
	</main>
</Sidebar.Provider>
<ModeWatcher />
