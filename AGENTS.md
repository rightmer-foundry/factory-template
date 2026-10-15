# Working in a Foundry project

This repo was created by the Foundry. A human reviews every change from a
phone; your job is to make that review quick and safe.

## The loop

1. Work on a branch. Never push to `main` (it is protected; the push fails).
2. Push. CI builds, tests, and deploys your branch to this project's
   **preview** Worker. The preview is behind Cloudflare Access: only the
   human can open it, so don't expect to fetch it yourself.
3. Open a PR. Fill in the template: what changed, how to check it on the
   preview, risk boxes.
4. If CI fails, read the check output (or `deploy_status` from the
   factory-mcp server), fix it, and push again. **Push your own fixes** —
   never ask the human to push to your branch.
5. The human approves and merges; `main` deploys to production.
   To undo a merged change, open a revert PR.

## Rules

- Never edit `.github/` or `.factory/`. They are protected and the push
  is rejected. CI changes happen in `rightmer-foundry/factory-workflows`.
- Bindings (D1, KV, R2) come only from the Foundry manifest. Declare them in
  `wrangler.jsonc` by name for local dev; the deployer ignores the IDs and
  binds the real resources. `.factory/manifest.json` lists what is granted;
  `npm run check-bindings` compares the two.
- Need a new binding? Call the factory-mcp tool `request_bindings` and wait
  until the PR it opens is merged and `.factory/manifest.json` shows it.
- Previews and production have **separate** databases and buckets. A preview
  can never touch production data.
- D1 migrations go in `migrations/NNNN_name.sql` (forward-only, ≤ 1 MB each).
  They run on the preview database on every branch deploy and on production
  after merge. A `DROP` is flagged to the reviewer — avoid it unless asked.
- Secrets are set by the human (`wrangler secret put`), never committed.
  Read them from `env` like any binding.

## Local development

```sh
npm install
npm run dev          # wrangler dev with local D1/KV/R2 simulators
npm test             # vitest in workerd
npm run typecheck
npm run check-bindings
```

## Deploy errors and what to do

| `code` | Meaning | Do this |
| --- | --- | --- |
| `bad_token` | OIDC token missing, expired or invalid | Re-run the job; if it persists, report it |
| `wrong_org` | Repo is not in `rightmer-foundry` | Report it; you are in the wrong repo |
| `untrusted_workflow` | CI did not run through the released workflow | Don't edit `.github/`; report it |
| `unknown_project` | This repo has no Foundry manifest entry | Check `project_status`; the project may not be provisioned yet |
| `archived` | The project was archived | Stop; ask the human |
| `bad_target` | Ref/event/environment don't form a valid preview or production deploy | Push to a branch; only merges deploy production |
| `stale_run` | An older production run tried to deploy after a newer one | Open a revert PR instead of re-running old runs |
| `rate_limited` | Too many deploys this hour | Batch your changes; wait and push again |
| `too_large` | Bundle over 25 MB | Shrink the bundle or assets |
| `bad_bundle` | Malformed build output or migration file | Fix the build or migration naming (`NNNN_name.sql`) |
| `flag_not_allowed` | A compatibility flag isn't allowed for this project | Remove it, or ask for it in `projects.yaml` |
| `migration_failed` | A D1 migration errored; nothing was deployed | Fix the SQL in a new migration and push |
| `cloudflare_error` | Cloudflare rejected the upload | Read `message`; fix and push, or report it |
