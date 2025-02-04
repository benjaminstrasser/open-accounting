<script lang="ts">
	import Book from 'lucide-svelte/icons/book';
	import House from 'lucide-svelte/icons/house';
	import NotebookPen from 'lucide-svelte/icons/notebook-pen';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ModeDropdown from "./mode-dropdown.svelte"

	// Menu items.
	const items = [
		{
			title: 'Home',
			url: '/',
			icon: House
		},
		{
			title: 'Journal',
			url: '/journal',
			icon: NotebookPen
		},
		{
			title: 'Accounts',
			url: '/account',
			icon: Book
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<ModeDropdown />
	</Sidebar.Footer>
</Sidebar.Root>
