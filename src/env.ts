// Bindings and vars this Worker receives. Keep in sync with
// .factory/manifest.json (the names the Foundry will actually bind) and
// wrangler.jsonc (local dev). `npm run types` can generate this instead.
export interface Env {
  APP_TITLE?: string;
}
