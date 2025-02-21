export type InvoiceItem = {
	description: string;
	price: number;
	quantity: number;
};

export type BankDetails = {
	name: string;
	iban: string;
	bic: string;
};

export type BillingContact = {
	name: string;
	phone: string;
};
