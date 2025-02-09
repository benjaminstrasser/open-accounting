<script lang="ts">
	type InvoiceItem = {
		description: string;
		price: number;
		quantity: number;
	};

	type Address = {
		companyName: string;
		street: string;
		zipCode: string;
		city: string;
		country: string;
		uid: string;
	};

	type BankDetails = {
		iban: string;
		bic: string;
	};

	type Contact = {
		address: Address;
		email: string;
		phone: string;
	};

	type Invoice = {
		invoiceNumber: string;
		period: string;
		date: string;
		recipient: Address;
		sender: Address;
		items: InvoiceItem[];
		bankDetails: BankDetails;
		contact: Contact;
	};

	export let invoice: Invoice = {
		invoiceNumber: '202501/1',
		period: '01/2025',
		date: '31.01.2025',
		recipient: {
			companyName: 'openDEVS GmbH',
			street: 'Mandlgasse 20/3-5',
			zipCode: '1120',
			city: 'Wien',
			country: 'Österreich',
			uid: 'ATU75054469'
		},
		sender: {
			companyName: 'TBD GmbH',
			street: 'TBD Street 123',
			zipCode: '123',
			city: 'Wien',
			country: 'Österreich',
			uid: '123123'
		},
		items: [
			{
				description: 'Senior Software-Engineer für Red Bull Media House / MyExperience',
				price: 88.0,
				quantity: 128.5
			}
		],
		bankDetails: {
			iban: 'Fake IBAN',
			bic: 'Gasd'
		},
		contact: {
			address: {
				companyName: 'TBD GmbH',
				street: 'TBD Street 123',
				zipCode: '123',
				city: 'Wien',
				country: 'Österreich',
				uid: '123123'
			},
			email: 'contact@aots.lo',
			phone: '+12312312312321'
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(amount);
	};
</script>

<div class="page">
	<div class="header">
		<div class="address-block">
			<strong>{invoice.recipient.companyName}</strong>
			<span>{invoice.recipient.street}</span>
			<span>{invoice.recipient.zipCode} {invoice.recipient.city}</span>
			<span>{invoice.recipient.country}</span>
			<span>UID: {invoice.recipient.uid}</span>
		</div>

		<div class="address-block">
			<strong>{invoice.sender.companyName}</strong>
			<span>{invoice.sender.street}</span>
			<span>{invoice.sender.zipCode} {invoice.sender.city}</span>
			<span>{invoice.sender.country}</span>
			<span>UID: {invoice.sender.uid}</span>
		</div>
	</div>

	<div class="invoice-date">
		<p>Datum: {invoice.date}</p>
	</div>

	<div class="invoice-details">
		<h1>RECHNUNG</h1>
		<p>Rechnung-Nr.: <strong>{invoice.invoiceNumber}</strong></p>
	</div>

	<p>Danke für Ihre Beauftragung.</p>

	<p>Vereinbarungsgemäß stellen wir in Rechnung:</p>

	<table class="items-table">
		<thead>
			<tr>
				<th>Position</th>
				<th>Leistungszeitraum {invoice.period}</th>
				<th>Preis/h</th>
				<th>Anzahl</th>
				<th>Betrag</th>
			</tr>
		</thead>
		<tbody>
			{#each invoice.items as item, i}
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
				<td
					>{formatCurrency(
						invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
					)}</td
				>
			</tr>
			<tr>
				<td colspan="4" align="right">+20% USt.:</td>
				<td
					>{formatCurrency(
						invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.2
					)}</td
				>
			</tr>
			<tr>
				<td colspan="4" align="right"><strong>Rechnungsbetrag:</strong></td>
				<td
					>{formatCurrency(
						invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.2
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
		IBAN: {invoice.bankDetails.iban}<br />
		BIC: {invoice.bankDetails.bic}
	</div>

	<p>
		Mit besten Grüßen,<br />
		GUI<br />
		{invoice.sender.companyName}
	</p>

	<div class="footer">
		<div class="address-block">
			<strong>{invoice.sender.companyName}</strong>
			<span>{invoice.sender.street}</span>
			<span>{invoice.sender.zipCode} {invoice.sender.city}</span>
			<span>E-Mail: {invoice.contact.email}</span>
			<span>Telefon:{invoice.contact.phone}</span>
		</div>
		<div>Bankverbindung:</div>
		<span>UID: {invoice.sender.uid}</span>
	</div>
</div>

<style>
	.page {
		width: 210mm; /* A4 width */
		height: 297mm; /* A4 height */
		padding: 20mm;
		font-family: sans-serif;
		box-sizing: border-box; /* Include padding in width and height */
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.invoice-date {
		display: flex;
		justify-content: flex-end;
	}

	.invoice-details {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20px;
	}

	.address-block {
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
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
		margin-bottom: 10px;
	}
</style>
