import { z } from 'zod';

export const BankDetailsSchema = z.object({
	name: z.string().min(1, 'Bank name is required.'),
	iban: z.string().min(1, 'IBAN is required.'),
	bic: z.string().min(1, 'BIC is required.')
});

export const BillingContactSchema = z.object({
	name: z.string().min(1, 'Billing contact name is required.'),
	phone: z.string().min(1, 'Billing contact phone is required.')
});

export const InvoiceItemSchema = z.object({
	description: z.string().min(1, 'Invoice item description is required.'),
	price: z.number().positive(),
	quantity: z.number().positive()
});

export const CreateBill = z.object({
	sender: z.object({}),
	recipient: z.object({}),
	issueDate: z.string().min(1, 'Issue Date of bill is required.'),
	invoiceNumber: z.string().min(1, 'Invoice Number of bill is required.'),
	period: z.string().min(1, 'Billing period is required.'),
	items: z.array(InvoiceItemSchema),
	bankDetails: BankDetailsSchema,
	contact: BillingContactSchema
});

export type InvoiceItem = {
	description: string;
	price: number;
	quantity: number;
};

export type BankDetails = z.infer<typeof BankDetailsSchema>;
export type BillingContact = z.infer<typeof BillingContactSchema>;
