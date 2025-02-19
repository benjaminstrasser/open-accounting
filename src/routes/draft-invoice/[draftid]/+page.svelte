<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { InvoiceSchema } from '$lib/models/invoice.model';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { cn } from '$lib/utils';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';
	import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	import type { PageProps } from './$types';
	import PdfViewer from '$lib/components/pdf-viewer.svelte';

	const { data }: PageProps = $props();

	const df = new DateFormatter('de-DE', { dateStyle: 'short' });
	let value = $state(today(getLocalTimeZone()));

	// Initialize the superForm with InvoiceSchema.
	const form = superForm(data.form, {
		validators: zodClient(InvoiceSchema),
		dataType: 'json',
		async onUpdated({ form }) {
			if (form.valid) {
				toast.success('Invoice Created!');
				await goto(`/invoice/${form.message.invoiceid}`);
			} else {
				toast.error('Error Creating Invoice!');
			}
		}
	});
	const { enhance, form: formData } = form;

	$formData.id = data.draftInvoice.id;

	// Update the invoice_date field whenever the calendar value changes.
	$effect(() => {
		if (value) {
			$formData.invoice_date = value.toDate(getLocalTimeZone());
		}
	});
</script>

<div class="flex gap-3">
	<div class="max-h-screen w-1/2 overflow-y-scroll">
		<PdfViewer file_data={data.draftInvoice.file_data} />
	</div>
	<div class="w-1/2">
		<form
			method="POST"
			use:enhance
			class="m-auto w-4/5 space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-md"
		>
			<div class="grid grid-cols-2 gap-4">
				<!-- Supplier -->
				<Form.Field {form} class="col-span-2" name="supplier">
					<Form.Control>
						<Form.Label class="text-sm text-muted-foreground">Supplier</Form.Label>
						<Input type="text" bind:value={$formData.supplier} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Amount -->
				<Form.Field {form} name="amount">
					<Form.Control>
						<Form.Label class="text-sm text-muted-foreground">Amount</Form.Label>
						<Input type="number" min="0" step="0.01" bind:value={$formData.amount} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- VAT -->
				<Form.Field {form} name="vat">
					<Form.Control>
						<Form.Label class="text-sm text-muted-foreground">VAT</Form.Label>
						<Input type="number" min="0" step="0.01" bind:value={$formData.vat} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Invoice Date with Calendar Popover -->
				<Form.Field {form} name="invoice_date">
					<Form.Control>
						<Form.Label class="text-sm text-muted-foreground">Invoice Date</Form.Label>
						<Popover.Root>
							<Popover.Trigger
								class={cn(
									buttonVariants({
										variant: 'outline',
										class: 'w-full justify-start text-left font-normal'
									})
								)}
							>
								<CalendarIcon class="mr-2" />
								{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
							</Popover.Trigger>
							<Popover.Content
								class="flex w-auto flex-col space-y-2 border border-border bg-card p-2 text-card-foreground"
							>
								<Calendar type="single" bind:value />
							</Popover.Content>
						</Popover.Root>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<!-- Submit Button -->
			<Button type="submit" class="w-full">Submit Invoice</Button>
		</form>
	</div>
</div>
