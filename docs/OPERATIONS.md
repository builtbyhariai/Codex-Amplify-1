# Operations

## States

`discovered → approved → generated → tested → staged → publish_ready → published`. Uncertainty routes to `needs_review`; incidents route to `paused`.

## Automation cadence

- Daily: import Store/search evidence, recompute rankings, check published run health.
- On change: generate candidates and run fixture/unit/schema tests.
- Weekly: staging smoke runs, cost-per-result and output-quality checks, README freshness.
- Monthly: terms/robots/license review dates, pricing margin analysis, stale Actor pruning.

## Alerts and auto-actions

- Schema drift: create repair branch, test fixtures, stage only.
- 429/timeouts: reduce concurrency/rate and retry with bounded exponential backoff.
- 401: notify owner; never rotate secrets automatically without configured secret manager.
- 403/CAPTCHA/access objection: pause immediately and require review.
- Output count/field completeness/cost regression: quarantine release and retain last-known-good build.

## Publication checklist

Passing tests, successful staging run, sample output inspection, cost and PPE margin test, README/schema completeness, compliance review, rollback build, and a signed unexpired approval matching the exact target config hash.

## Private staging deployment

The GitHub workflow for private staging was removed from this repo. Staging is currently manual: use `ApifyFactoryClient` (src/apify-client.ts) from a local script with your own `APIFY_TOKEN`; never commit the token. Nothing here publishes an Actor or configures monetization.
