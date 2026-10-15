# Foundry project template

Starting point for every repo in `rightmer-foundry`. Terraform generates
project repos from this template and then writes `.github/CODEOWNERS` and
`.factory/manifest.json`; it also replaces the placeholder name
`foundry-project` in `wrangler.jsonc` and `package.json`.

Agents: read `AGENTS.md`. Humans: review on the phone, merge to ship.

```sh
npm install && npm test && npm run typecheck
```
