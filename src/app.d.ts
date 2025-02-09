// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

type Logger = import('pino').Logger;

declare global {
	namespace App {
		interface Locals {
			logger: Logger;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
