<script lang="ts">
	import InvoiceA4 from '$lib/components/templates/invoice-a4.svelte';
	import type { BankDetails, BillingContact, InvoiceItem } from '$lib/models/billing.model';
	import type { CompanyData } from '$lib/models/company.model';

	const sender: CompanyData = {
		name: 'Sender GmbH',
		street: 'Sender Street 123',
		zip_code: '1234',
		city: 'Sender City',
		country: 'Österreich',
		uid: 'ATU1234567890',
		contact_email: 'contact@sender.io',
		contact_phone: '+43664/12345678'
	};

	const recipient: CompanyData = {
		name: 'Recipient GmbH',
		street: 'Recipient Street 456',
		zip_code: '5678',
		city: 'Recipient City',
		country: 'Österreich',
		uid: 'ATU0987654321',
		contact_email: 'contact@cecipient.io',
		contact_phone: '+43664/87654321'
	};

	const issueDate = '31.01.2025';
	const invoiceNumber = '202501/1';
	const period = '01/2025';
	const items: InvoiceItem[] = [
		{
			description: 'Senior Software Engineer',
			price: 250,
			quantity: 120.5
		}
	];

	const bankDetails: BankDetails = {
		name: 'Fantasy Bank',
		iban: 'AT12 3456 7890 1234 5678',
		bic: 'XYZ1234567890'
	};

	const contact: BillingContact = { name: 'Foo Bar', phone: '+43664/123123123' };
</script>

<InvoiceA4
	{sender}
	{recipient}
	{issueDate}
	{invoiceNumber}
	{period}
	{items}
	{bankDetails}
	{contact}
/>
