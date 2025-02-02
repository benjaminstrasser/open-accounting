import { z } from 'zod';

// Define the schema for a single ledger entry (excluding id and journal_entry_id)
const LedgerEntrySchema = z.object({
	account_id: z.number().int().positive(), // Must be a positive integer
	amount: z.number(), // Represents the monetary value
	side: z.enum(['debit', 'credit']) // Can be either 'debit' or 'credit'
});

// Define the schema for the journal information
const JournalEntrySchema = z.object({
	date: z.date(),
	description: z.string().min(1) // A required description with at least 1 character
});

// Final schema combining journal information and a list of ledger entries
export const CreateJournalWithEntriesSchema = z.object({
	journal: JournalEntrySchema, // The journal details
	ledgerEntries: z.array(LedgerEntrySchema).min(2) // At least two ledger entry is required
});

// Infer types
export type CreateLedgerEntry = z.infer<typeof LedgerEntrySchema>;
export type CreateJournalEntry = z.infer<typeof JournalEntrySchema>;
export type CreateJournalWithEntries = z.infer<typeof CreateJournalWithEntriesSchema>;

// Schema for a single ledger entry
const GetLedgerEntrySchema = z.object({
	id: z.number().int().positive(), // Ledger entry ID
	journal_entry_id: z.number().int().positive(), // The related journal entry ID
	account_id: z.number().int().positive(), // Must be a positive integer
	amount: z.number().int().positive(), // Monetary value stored as cents
	side: z.enum(['debit', 'credit']) // Transaction side
});

// Schema for a journal entry with associated ledger entries
const GetJournalEntrySchema = z.object({
	id: z.number().int().positive(), // Journal entry ID
	description: z.string().min(1), // Required description
	date: z.date(), // Transaction date
	ledgerEntries: z.array(GetLedgerEntrySchema) // List of ledger entries
});

// Export the schema for use in validation
export const GetJournalEntriesSchema = z.array(GetJournalEntrySchema);

// Infer TypeScript types from Zod schema
export type GetLedgerEntry = z.infer<typeof GetLedgerEntrySchema>;
export type GetJournalEntry = z.infer<typeof GetJournalEntrySchema>;
export type GetJournalEntries = z.infer<typeof GetJournalEntriesSchema>;
