<script lang="ts">
	import type { InvoiceItem, BankDetails, BillingContact } from '$lib/models/billing.model';
	import type { CompanyData } from '$lib/models/company.model';

	type Props = {
		sender: CompanyData;
		recipient: CompanyData;
		issueDate: string;
		invoiceNumber: string;
		period: string;
		items: InvoiceItem[];
		bankDetails: BankDetails;
		contact: BillingContact;
	};

	let { sender, recipient, issueDate, invoiceNumber, period, items, bankDetails, contact }: Props =
		$props();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(amount);
	};
</script>

{#snippet addressBlock(company: CompanyData, align: 'left' | 'right' = 'left')}
	<div class="address-block address-block--{align}">
		<strong>{company.name}</strong>
		<span>{company.street}</span>
		<span>{company.zip_code} {company.city}</span>
		<span>{company.country}</span>
		<span>UID: {company.uid}</span>
	</div>
{/snippet}

<div class="page">
	<div class="header">
		{@render addressBlock(recipient)}
		{@render addressBlock(sender, 'right')}
	</div>

	<div class="flex justify-end">
		<p>Datum: {issueDate}</p>
	</div>

	<div class="invoice-details">
		<h1 class="invoice-details__title">Rechnung</h1>
		<p>Rechnung-Nr.: <strong>{invoiceNumber}</strong></p>
	</div>

	<p class="mb-2">Danke für Ihre Beauftragung.<br /> Vereinbarungsgemäß stellen wir in Rechnung:</p>

	<table class="items-table">
		<thead>
			<tr>
				<th>Position</th>
				<th>Leistungszeitraum {period}</th>
				<th>Preis/h</th>
				<th>Anzahl</th>
				<th>Betrag</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item, i}
				<tr>
					<td>{i + 1}</td>
					<td>{item.description}</td>
					<td>{formatCurrency(item.price)}</td>
					<td>{item.quantity}</td>
					<td>{formatCurrency(item.price * item.quantity)}</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td colspan="4" align="right"><strong>Summe:</strong></td>
				<td>{formatCurrency(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</td>
			</tr>
			<tr>
				<td colspan="4" align="right">+20% USt.:</td>
				<td
					>{formatCurrency(
						items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.2
					)}</td
				>
			</tr>
			<tr>
				<td colspan="4" align="right"><strong>Rechnungsbetrag:</strong></td>
				<td
					>{formatCurrency(
						items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.2
					)}</td
				>
			</tr>
		</tfoot>
	</table>

	<p>
		Wir ersuchen um prompte Überweisung des Rechnungsbetrages auf das Konto bei der Erste Bank.
		Bitte führen Sie bei jeder Überweisung die Rechnungsnummer an.
	</p>

	<div class="bank-details">
		<span>IBAN:</span>
		<span>{bankDetails.iban}</span>
		<span>BIC:</span>
		<span>{bankDetails.bic}</span>
	</div>

	<p class="my-8">
		Mit besten Grüßen,<br />
		{contact.name}<br />
		{sender.name}
	</p>

	<div class="footer">
		<div class="address-block">
			<strong>{sender.name}</strong>
			<span>{sender.street}</span>
			<span>{sender.zip_code} {sender.city}</span>
			<span>E-Mail: {sender.contact_email}</span>
			<span>Telefon: {contact.phone}</span>
		</div>
		<div class="flex flex-col">
			<span>Bankverbindung:</span>
			<span>{bankDetails.name}</span>
			<div class="bank-details">
				<span>IBAN:</span>
				<span>{bankDetails.iban}</span>
				<span>BIC:</span>
				<span>{bankDetails.bic}</span>
			</div>
		</div>
		<div class="flex flex-col">
			<span>UID:</span>
			<span>{sender.uid}</span>
		</div>
	</div>
</div>

<style lang="scss">
	.page {
		width: 210mm; /* A4 width */
		height: 297mm; /* A4 height */
		padding: 20mm;
		font-family: sans-serif;
		box-sizing: border-box; /* Include padding in width and height */
		display: flex;
		flex-direction: column;
		background: white;
		color: black;
	}

	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 28px;
	}

	.invoice-details {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20px;

		&__title {
			text-transform: uppercase;
			font-size: 2rem;
		}
	}

	.address-block {
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;

		&--left {
			text-align: left;
		}

		&--right {
			text-align: right;
		}
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 20px;
	}

	.items-table th,
	.items-table td {
		border: 1px solid #ccc;
		padding: 8px;
		text-align: left;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		margin-top: auto; /* Push footer to the bottom */
		font-size: 0.8em;
	}

	.bank-details {
		display: grid;
		grid-template-rows: 1fr 1fr;
		grid-template-columns: auto 1fr;
		column-gap: 4px;
	}
</style>
