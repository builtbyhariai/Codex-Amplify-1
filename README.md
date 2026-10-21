# Apify Actor Factory

A config-driven factory for discovering, generating, staging, deploying, and maintaining business-data Actors. It follows the publicly described factory principles—standardize aggressively, pick boring valuable data, keep runtime costs predictable, and turn each new Actor into configuration—without copying proprietary code.

## Safety contract

- Start only with public or explicitly permitted sources.
- Respect robots directives, rate limits, access controls, copyright, privacy, and target terms.
- Never bypass authentication, CAPTCHAs, paywalls, or technical restrictions.
- Legal/ToS uncertainty changes a candidate to `needs_review` and blocks generation/deployment.
- Publishing a paid Actor requires a time-bound, target-specific approval record signed with `FACTORY_APPROVAL_SECRET`.
- The default is dry-run. Deployment creates private/staging Actors; Store publication remains gated.

## Quick start

```bash
npm install
cp .env.example .env
npm test
npm run scan -- --fixture fixtures/store-sample.json
npm run generate -- --target catalog/targets/us-public-procurement.yaml
npm run validate -- --actor generated/us-public-procurement
```

## Factory loop

1. `scan` imports Store/search evidence and scores demand, competition, buyer value, feasibility, durability, and risk.
2. `generate` accepts only cleared candidates and renders the canonical template from a target adapter config.
3. `validate` statically checks a generated Actor folder: `actor.json`, input schema (limits consistent with the target), dataset schema views, `package.json`, `target.json` identity fields, and the README title. It lists every problem and exits non-zero. It does not run the Actor, fixtures, or smoke tests yet.
4. `deploy` (API client module only; no CLI command yet) builds a private staging Actor and records its run evidence.
5. `publish` checks tests, risk review, pricing, approval signature, and expiry before any paid publication request.
6. `maintain` classifies failures, detects schema drift and quality regressions, and opens repair work without silently publishing breaking changes.

## What generate produces

`.actor/actor.json`, `.actor/INPUT_SCHEMA.json` (with a bounded `maxItems`), `.actor/dataset_schema.json` (a table view of the configured fields, per the Apify dataset schema format), `README.md`, `target.json`, Dockerfile, and `src/main.js`. Target ids must be lowercase letters, digits and dashes; start URLs must be https and on the host allowlist.

## Adding Actor #100

Create one YAML file in `catalog/targets/` defining discovery URLs, permitted fields, selectors/JSON paths, pagination, limits, identity keys, pricing events, fixtures, and compliance evidence. The generator produces code, schemas, tests, and Store copy.

## Commands

Run `tsx src/cli.ts --help`. Production scheduling belongs in CI/cron; keep secrets in the platform secret store. See [docs/OPERATIONS.md](docs/OPERATIONS.md), [docs/SCORING.md](docs/SCORING.md), and [docs/COMPLIANCE.md](docs/COMPLIANCE.md).

## Tests

`npm test` runs the Node test runner (no network). `npm run build` type-checks with `tsc`.

## Current scope

The included example targets a public procurement API and performs no browser evasion. The Store scanner accepts exported/API evidence rather than scraping restricted Store pages. Connect live Apify credentials only after reviewing the generated plan.
