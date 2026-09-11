# Launch-safety database validation

September 11, 2026 — PASS in isolated databases. Production was not read, changed, or deployed.

## Results

The complete migration history through 019 ran successfully in the existing PostgreSQL-in-WebAssembly test runtime. The targeted launch suite also passed on native PostgreSQL 18.4, using a newly created database, synthetic member records, the repository's seed catalog, and a private Unix socket with TCP listening disabled.

| Check | Result |
| --- | --- |
| Upgrade from 018 with existing wishes/preferences | Preserves existing values; wishes become pending; selected interests are copied |
| Failure partway through migration | Schema and data changes roll back together |
| Word counting | Matches browser rules for tested 4/11 boundaries, punctuation, hyphens, apostrophes, numbers, accented text, combining marks, Chinese, and emoji |
| Wish submission | New wishes remain pending; duplicates reuse existing state; inactive/missing members and invalid descriptions are rejected |
| Access restrictions | Anonymous and authenticated browser roles cannot directly read/write wishes or preferences, or call moderation functions |
| Moderation | Active founder identity required; publish/hide changes visibility; stale revisions rejected; successful decisions are audited |
| Capacity and retries | Maximum 10 pending/published wishes; retries at capacity remain idempotent; hiding releases capacity |
| Pagination | All 61 historical test rows reached without duplicate IDs |
| Preferences | Selected interests survive learned activity and history reset; clear/edit and personalization opt-out work independently |
| Export/deletion | Member-scoped database reads include wishes/interests; erasure removes them without affecting another member |

## Real concurrent transactions

These checks used two distinct PostgreSQL backend connections. Tests observed the second transaction waiting on a database lock before releasing the first transaction; they were not merely queued calls on one connection.

1. At nine wishes, transaction A inserts wish ten and holds the lock. Transaction B waits, then returns the limit response after A commits. Final count: ten.
2. Two matching submissions yield one row and a duplicate response.
3. Two moderation decisions based on revision zero yield one accepted decision and one stale-decision rejection. Only one audit record is written.
4. Twenty rate-limit attempts across two connections accept exactly three.
5. Account deletion racing a wish submission leaves no orphan wish; later submission from the deleted account is rejected.

The native test server was stopped and its synthetic database removed automatically after success. Temporary downloaded test dependencies remain outside the application in /private/tmp/trymybuild-native-db.rnr55b. No application dependency or lockfile changes were needed.

## Reproducible checks

- General migration, credits, inbox, verification and erasure suite:
  `node scripts/test-review-database.mjs /private/tmp/trymybuild-release-db.4CXXcb/node_modules/@electric-sql/pglite/dist/index.js`
- Targeted upgrade and launch-safety suite:
  `node scripts/test-launch-database.mjs /private/tmp/trymybuild-release-db.4CXXcb/node_modules/@electric-sql/pglite/dist/index.js`
- Native database plus cross-connection checks:
  `node scripts/test-launch-concurrency.mjs /private/tmp/trymybuild-native-db.rnr55b`
- Existing application unit tests: 158 passed.
- Diff whitespace check: passed.

The native test dependency is [embedded-postgres](https://github.com/leinelissen/embedded-postgres), installed only in the temporary test directory, with package install scripts disabled. Its bounded library-symlink setup was inspected before use. Tests do not load production environment variables or accept a remote database address.

## What remains before production

This validates the committed migration history plus the local 019 migration, not any unrecorded production schema drift or hosted-provider configuration.

Before applying 019, obtain approval, confirm the target database and its current schema, verify a backup/recovery route, and plan the matching application deployment. Existing public wishes will temporarily leave the public feed until reviewed. Previously overwritten sign-up interests cannot be reconstructed from the database; the migration preserves whichever interests are currently stored.

After application, verify function permissions/schema availability through the actual hosted API, then deploy the matching application and test real sign-up, preference persistence, wish submission/review, and export/deletion with approved test accounts. The local database tests are not a substitute for WorkOS login, email-delivery, or production-browser tests.
