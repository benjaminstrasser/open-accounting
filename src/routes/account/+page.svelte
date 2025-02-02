<script lang="ts">
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();


</script>

<div class="container mx-auto p-6">
	<!-- Page Header -->
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">Accounts Overview</h1>
	</div>

	<!-- Table Component -->
	<Table class="shadow-md">
		<TableHeader>
			<TableRow>
				<TableHead>Number</TableHead>
				<TableHead>Name</TableHead>
				<TableHead>Normal Balance</TableHead>
				<TableHead>Type</TableHead>
				<TableHead>Balance</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each data.accounts as account}
				<TableRow class="cursor-pointer hover:bg-gray-100" on:click={() => goto(`/account/${account.id}`)}>
					<TableCell>{account.account_number}</TableCell>
					<TableCell>{account.name}</TableCell>
					<TableCell class="capitalize">{account.type}</TableCell>
					<TableCell class="capitalize">{account.normal_balance}</TableCell>
					<TableCell class="font-bold">{account.balance}</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
