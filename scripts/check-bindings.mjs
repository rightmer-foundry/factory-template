#!/usr/bin/env node
// Local convenience: compare wrangler.jsonc bindings with the names the
// Foundry grants this project (.factory/manifest.json). CI runs the same
// check from factory-workflows; the deployer enforces it regardless.
import { readFileSync } from 'node:fs';

function parseJsonc(text) {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inString) {
      out += c;
      if (c === '\\') { out += n ?? ''; i++; }
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; out += c; continue; }
    if (c === '/' && n === '/') { while (i < text.length && text[i] !== '\n') i++; out += '\n'; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++; i++; continue; }
    out += c;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

const wrangler = parseJsonc(readFileSync('wrangler.jsonc', 'utf8'));
const manifest = JSON.parse(readFileSync('.factory/manifest.json', 'utf8'));
const granted = new Map(manifest.bindings.map((b) => [b.name, b.type]));
const declared = [
  ...(wrangler.d1_databases ?? []).map((b) => [b.binding, 'd1']),
  ...(wrangler.kv_namespaces ?? []).map((b) => [b.binding, 'kv']),
  ...(wrangler.r2_buckets ?? []).map((b) => [b.binding, 'r2']),
];
const unsupported = ['services', 'queues', 'durable_objects', 'hyperdrive', 'vectorize', 'analytics_engine_datasets', 'ai', 'browser', 'workflows', 'dispatch_namespaces', 'mtls_certificates', 'send_email', 'routes', 'route', 'triggers']
  .filter((k) => wrangler[k] !== undefined && !(Array.isArray(wrangler[k]) && wrangler[k].length === 0));

const errors = [];
for (const [name, type] of declared) {
  if (!granted.has(name)) errors.push(`${name} (${type}) is not granted to this project`);
  else if (granted.get(name) !== type) errors.push(`${name} is granted as ${granted.get(name)}, declared as ${type}`);
}
for (const k of unsupported) errors.push(`"${k}" in wrangler.jsonc is not supported by the Foundry deployer`);

if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  console.error('\nTo get a new binding, call the factory-mcp tool request_bindings and wait for the PR to be merged.');
  process.exit(1);
}
console.log(`bindings ok (${declared.length} declared, ${granted.size} granted)`);
