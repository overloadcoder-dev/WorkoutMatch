# WorkoutMatch

WorkoutMatch is a static, browser-only workout builder for adults with limited
time, space, or equipment. A user chooses what is available and the environment
they need to respect; the app returns a balanced workout that can be started,
adjusted, saved locally, printed, or run in guided mode.

> **Important:** WorkoutMatch provides general educational and organizational
> information. It does not diagnose conditions, assess technique, prescribe
> rehabilitation, or replace advice from a qualified clinician or exercise
> professional.

The application has no backend, accounts, cloud synchronization, or workout API.
Core editorial content is emitted as static HTML. Interactive tools run in the
browser, and saved workout data remains in the current browser profile unless
the user explicitly exports it.

## What is included

- A constraint-aware workout generator for 5, 10, 15, 20, 30, and 45-minute
  sessions, with randomized initial seeds and deterministic reproduction.
- Full and quick generator workflows using the same pure TypeScript engine.
- Bodyweight, one-dumbbell, two-dumbbell, resistance-band, chair/bench, and
  pull-up-bar support.
- Quiet, no-jumping, very-small-space, standing-only, no-floor, difficulty, and
  movement-to-avoid filters.
- Lock, compatible replacement, regenerate-unlocked, print, local save, and
  privacy-safe share controls.
- A guided workout player with timers and feature-detected Web Audio, vibration,
  fullscreen, and Screen Wake Lock enhancements.
- A build-time validated library of 77 distinct exercises and one static detail
  page per exercise.
- Eight substantial curated workouts rather than programmatic thin pages.
- Adult BMI, Mifflin–St Jeor BMR, and TDEE calculators with transparent formulas
  and limitations.
- Browser-local workout history, saved plans, completion details, JSON
  export/import, and clear-all controls.
- Static metadata, canonical URLs, structured data, sitemap, robots output,
  print styles, light/dark themes, and accessibility-focused interaction.

## Architecture

WorkoutMatch uses:

- Astro 7 in static-output mode;
- Tailwind CSS 4 through the local Vite plugin;
- strict TypeScript, including `exactOptionalPropertyTypes` and
  `noUncheckedIndexedAccess`;
- Zod for exercise, calculator, storage, URL, and import validation;
- native IndexedDB and `localStorage` for browser-local state;
- Vitest for pure logic tests;
- Playwright and `@axe-core/playwright` for browser workflows and automated
  accessibility checks.

There is no site-wide client framework or router. Astro pages render the
indexable content, while focused component scripts provide the generator,
filters, calculators, timers, and progress tools. Production output is written
to `dist/`.

The main source boundaries are:

```text
src/
  components/       Astro UI grouped by feature
  config/           brand, canonical-origin, advertising, and locale settings
  data/             exercises, generator templates, curated plans, citations
  layouts/          shared page shell and SEO integration
  lib/
    calculators/    pure formulas, conversion, and input validation
    generator/      pure filtering, scoring, generation, operations, sharing
    storage/        IndexedDB, schemas, migration, import/export
    validation/     authoritative exercise schemas
  pages/            static routes and exercise detail generation
  scripts/          route-specific browser behavior
  styles/           global theme, responsive, reduced-motion, and print styles
  types/            centralized exercise, workout, and local-data contracts
public/              self-hosted static assets and deployable `_headers`
tests/
  unit/             calculator, exercise, generator, and storage tests
  e2e/              workflows, accessibility, console, and responsive checks
```

## Requirements and setup

- Node.js **22.12.0 or newer**, as declared in `package.json`.
- npm and a browser supported by the installed Playwright release.

Install from the lockfile:

```sh
npm ci
```

Install the Chromium binary used by the browser tests:

```sh
npx playwright install chromium
```

On a fresh Linux CI image, Playwright may also need its system packages:

```sh
npx playwright install --with-deps chromium
```

Copy the optional environment example and set the real production origin before
building a deployable artifact:

```sh
cp .env.example .env
```

PowerShell equivalent:

```powershell
Copy-Item .env.example .env
```

Start the development server:

```sh
npm run dev
```

Astro prints the local URL, normally `http://localhost:4321/`.

### Public URL configuration

`PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` are public build configuration, not
secrets. Set the first to the deployed origin. Keep the base path at `/` for a
root domain, or set it to the repository path for a project site:

```dotenv
PUBLIC_SITE_URL=https://www.example.com
PUBLIC_BASE_PATH=/
```

The value is consumed at build time by `astro.config.mjs` and
`src/config/site.ts` for application links, assets, canonical URLs, Open Graph
URLs, structured data, `robots.txt`, and sitemap generation. If the origin is
omitted, the build uses
`https://workoutmatch.example`; that fallback is useful locally but must not be
published as a real canonical origin.

## Commands

| Command                | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Start the Astro development server.                           |
| `npm run build`        | Create the static production site in `dist/`.                 |
| `npm run preview`      | Serve the current `dist/` output locally.                     |
| `npm run check`        | Run Astro diagnostics and strict TypeScript checks.           |
| `npm run lint`         | Run ESLint across the repository.                             |
| `npm run format`       | Rewrite supported files with Prettier.                        |
| `npm run format:check` | Check formatting without changing files.                      |
| `npm test`             | Run all unit tests once with Vitest.                          |
| `npm run test:watch`   | Run Vitest in watch mode.                                     |
| `npm run test:e2e`     | Build, then run all Playwright projects and specs.            |
| `npm run test:a11y`    | Build, then run Playwright tests tagged `@a11y`.              |
| `npm run verify`       | Run check, lint, unit tests, build, and all Playwright tests. |

`npm run verify` is the preferred pre-release check. It requires the Playwright
Chromium binary to be installed.

## Route map

Astro is configured with `output: 'static'` and `trailingSlash: 'always'`.
Routes are emitted as extensionless directories containing static HTML.

### Product and tools

| Route               | Purpose                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `/`                 | Product introduction and primary navigation.                     |
| `/generate/`        | Full constraint-aware generator.                                 |
| `/quick-workout/`   | Shorter generator form with beginner-friendly defaults.          |
| `/workout/player/`  | Transient guided workout player; `noindex, nofollow`.            |
| `/timers/interval/` | Standalone interval timer.                                       |
| `/my-progress/`     | Browser-local plans/history and data tools; `noindex, nofollow`. |

### Exercise and workout content

| Route                        | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `/exercises/`                | Searchable and filterable exercise directory.  |
| `/exercises/[slug]/`         | 77 build-time generated exercise detail pages. |
| `/workouts/`                 | Directory of the eight curated sessions.       |
| `/workouts/no-equipment/`    | No-equipment full-body session.                |
| `/workouts/one-dumbbell/`    | One-dumbbell session.                          |
| `/workouts/two-dumbbells/`   | Matched-pair dumbbell session.                 |
| `/workouts/resistance-band/` | Resistance-band session.                       |
| `/workouts/quiet-apartment/` | Quiet apartment session.                       |
| `/workouts/no-jumping/`      | No-jumping session.                            |
| `/workouts/standing-only/`   | All-standing session.                          |
| `/workouts/15-minute/`       | Fixed 15-minute session.                       |

### Calculators and editorial pages

| Route                | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `/calculators/`      | Adult calculator directory.                                     |
| `/calculators/bmi/`  | Adult BMI calculator and CDC category context.                  |
| `/calculators/bmr/`  | Mifflin–St Jeor resting-energy estimator.                       |
| `/calculators/tdee/` | Activity-factor TDEE estimate and neighboring-factor range.     |
| `/methodology/`      | Generator rules, formulas, sources, and limitations.            |
| `/safety/`           | General readiness and stop/seek-help guidance.                  |
| `/privacy/`          | Network, on-device processing, storage, and sharing boundaries. |
| `/terms/`            | Terms of use.                                                   |
| `/about/`            | Product scope and principles.                                   |
| `/404/`              | Custom not-found document; noindex.                             |

The build also emits `/robots.txt` and `/sitemap-index.xml`. The sitemap excludes
`/my-progress/` and `/workout/player/`.

## Generator design

The generator under `src/lib/generator/` is pure TypeScript with no DOM
dependency. Its public exports are collected in `src/lib/generator/index.ts`.

Generation follows these stages:

1. Normalize and validate goal, experience, duration, equipment, focus,
   environment, and movement-to-avoid values.
2. Remove exercises that violate equipment, space, noise, impact, position,
   difficulty, or stress-tag constraints.
3. Select a focus- and duration-specific movement-slot template.
4. Score compatible candidates using focus, goal, compound movement, recent-use,
   primary-muscle, and stress-repetition signals.
5. Fill all required slots through backtracking, preventing duplicates and
   excessive repeated loading.
6. Derive sets, repetitions or time/distance, rest, and unilateral side
   handling within the section budgets.
7. Add warm-up and cooldown sections inside the requested duration and validate
   the complete result before returning it.

Full-body sessions with enough time seek knee-dominant, hip-dominant, push,
pull, and core/carry coverage. Short and muscle-focused sessions use their own
reduced templates instead of forcing the long full-body checklist.

Important hard rules include:

- Bodyweight movements remain available with any equipment selection.
- Two dumbbells can satisfy a one-dumbbell movement, but one dumbbell can never
  satisfy a simultaneous two-dumbbell requirement.
- Standing-only and no-floor both exclude every non-standing position.
- Quiet excludes non-quiet entries; no-jumping excludes high-impact jumping.
- Beginner generation excludes intermediate- and advanced-only exercises.
- Movement-to-avoid tags are binding filter preferences, never diagnoses.
- An impossible combination returns reasons and concrete constraints to relax;
  the engine does not silently ignore an option.

The generator version is `wm1`; the current exercise dataset version is
`2026.08.1`. The same normalized input, generator version, dataset version, and
seed reproduces the same workout. Regeneration preserves locked slots, while
replacement searches the original slot and current constraint pool without
duplicating another exercise.

The browser UI creates a fresh cryptographic random seed for each initial
submission. The pure engine remains deterministic when a caller supplies a seed,
which supports safe sharing and repeatable tests.

The engine accepts optional recent exercise IDs to lower their score without
making generation fail. The current browser UI does not automatically read
progress history into that option.

### Share-link privacy

Workout links use an explicit allowlist: generator version, dataset version,
seed, duration, equipment, focus, experience level, goal, space, quiet,
no-jumping, standing-only, and no-floor. Unknown generator or dataset versions
are rejected.

Movement-to-avoid tags, calculator values, local history, names, body
measurements, weights, and free text are not serialized. When movement-to-avoid
filters were used, the UI warns that a shared recreation omits them and may
therefore differ.

## Exercise data and authoring

`src/data/exercises.ts` is the authoritative exercise collection. Do not copy
exercise facts into generator code or create a second library for page content.
Central unions and contracts live in `src/types/exercise.ts`.

Each entry includes stable identity, searchable aliases, instructions,
breathing, common mistakes, safety notes, muscles, movement pattern, exact
equipment, difficulty, position, impact, noise, space, unilateral/compound
flags, rep mode, prescriptions for all experience levels, conservative stress
tags, variations, replacements, review state, and sources.

When adding or changing an exercise:

1. Use a unique `ex-...` kebab-case ID and a unique route slug. IDs are durable
   references; avoid changing them after release.
2. Write complete, non-diagnostic instructions rather than renaming an existing
   movement to increase the count.
3. Provide a prescription matching `repMode` for beginner, intermediate, and
   advanced levels.
4. Add only valid central union values from `src/types/exercise.ts`.
5. Resolve every easier, harder, and replacement ID in the same collection.
6. Update `EXERCISE_DATASET_VERSION` when a content change can alter deterministic
   generation or shared-workout reproduction.
7. Run the exercise-data and generator tests, then the full verification suite.

The dataset is parsed through `parseExerciseDataset` during module import/build.
The Zod schema enforces at least 60 entries, unique IDs/slugs, valid cross
references, non-empty instructional fields, local media paths, non-overlapping
primary/secondary muscle lists, and sensible complete prescriptions.

All current entries have `reviewed: false`; the site makes no medical or
professional review claim. Do not change that flag without a real reviewer,
documented scope, and auditable review record.

### Exercise media

The current library is intentionally text-only. There are no invented posters,
videos, or licenses and no empty media containers. If media is added later:

- use a locally owned or properly licensed file under `public/`;
- record the required attribution in the exercise entry;
- never scrape or hotlink a demonstration;
- provide useful written instructions even when media cannot load;
- verify lazy loading, dimensions/aspect ratio, keyboard behavior, captions or
  equivalent access where applicable, performance, and CSP compatibility.

### Curated workouts

The eight editorial sessions live in `src/data/curated-workouts.ts`; their route
files live under `src/pages/workouts/`. A new curated page should add distinct,
substantial value, including setup, pacing, adaptations, limitations, and links
to exercise detail pages. Do not generate landing pages for every parameter
combination.

## Calculators and source caveats

Calculator logic in `src/lib/calculators/` is pure and unit tested. Metric and
imperial inputs normalize to kilograms and centimetres. The UI stores no body
measurements or results; it stores only the unit system when the user explicitly
checks the remember-units option.

### BMI

```text
BMI = weight in kilograms / (height in metres)²
```

The displayed adult categories are below 18.5, 18.5 to below 25, 25 to below 30,
and 30 or above, with the CDC obesity class subdivisions. The page is for adults
aged 20 and older. BMI is a screening measure, not a diagnosis or direct body-fat
measurement.

Official context:

- [CDC: About Body Mass Index](https://www.cdc.gov/bmi/about/index.html)
- [CDC: Adult BMI Categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html)

### Mifflin–St Jeor BMR estimate

With kilograms, centimetres, and age in years:

```text
Male equation   = 10 × kg + 6.25 × cm − 5 × age + 5
Female equation = 10 × kg + 6.25 × cm − 5 × age − 161
```

The tool validates ages 20–120 and can show either equation or both. The sex
field is required by this specific published equation; it is not a complete
statement of gender identity. The result predicts resting energy expenditure—it
does not measure it.

Official source:

- [Mifflin et al., 1990, PubMed record](https://pubmed.ncbi.nlm.nih.gov/2305711/)

### TDEE

```text
TDEE estimate = Mifflin–St Jeor estimate × selected activity factor
```

The centralized activity factors are 1.2, 1.375, 1.55, 1.725, and 1.9. They are
product heuristics, not values derived from the Mifflin paper. Category selection
is subjective. The UI therefore shows the selected estimate, the neighboring
factor range where available, and −10%/maintenance/+10% arithmetic comparisons.
Those comparisons are not diet prescriptions or promises of weight change.

Health-context citations are centralized in `src/data/citations.ts`. A
`reviewedOn` value means the linked source was checked for the site on that date;
it is not a medical-review date. Before changing health copy or formulas, check
the current primary source, update the centralized record honestly, and run the
calculator tests. Do not copy long passages from source pages.

## Local data and privacy boundary

WorkoutMatch application code does not send generator inputs, movement-to-avoid
choices, calculator values, or local workout records to an application server.
Normal website asset requests and deployment-host logs still exist; do not claim
that using the website causes zero network requests.

IndexedDB database `workoutmatch`, currently database/schema version 2, contains:

- completed and ended-early workout records;
- completed/skipped exercises and entered set, rep, duration, and optional
  weight details;
- saved generated plans;
- the versioned preferences record when one exists.

Small state in `localStorage` is limited to explicit theme/unit preferences and
temporary guided-workout/session recovery. There is no body-weight history, and
calculator measurements/results are not added to progress.

Local data is not an automatic backup. It may be blocked, become unavailable,
be cleared by the browser, or remain visible to another person using the same
browser profile. The UI keeps generation and workout playback useful when
storage is unavailable, but saving and recovery cannot be guaranteed.

### Export, import, and migration

Exports use the `workoutmatch-local-data` JSON format and a sanitized filename.
The object URL is revoked after download. Exported files leave browser storage
and must be protected by the user.

Imports are handled on-device and:

- are capped at 1 MiB;
- reject invalid JSON, unsupported versions, nesting beyond 24 levels, and
  `__proto__`, `prototype`, or `constructor` keys;
- pass through strict Zod schemas with collection and field limits;
- migrate the known version-1 export shape to version 2;
- upgrade known version-1 IndexedDB workout and plan records in place;
- show incoming and conflicting record counts before writing;
- support merge, where incoming matching IDs win, or full replacement;
- require explicit confirmation for replacement and clear-all operations.

Clear all removes IndexedDB records plus every WorkoutMatch `localStorage` key,
including temporary guided-workout recovery and theme/unit preferences. If the
browser blocks a key removal, the UI reports a partial clear instead of claiming
that everything was removed.

When changing the local schema, increment the schema/database versions as
appropriate, add a narrowly defined migration from every supported prior
version, keep unknown versions rejected, and extend `tests/unit/storage.test.ts`.
Never reinterpret malformed data merely to make an import succeed.

## SEO and localization

`src/components/seo/SeoHead.astro` supplies titles, descriptions, canonicals,
robots directives, Open Graph, Twitter cards, and `en`/`x-default` alternate
links. Pages add JSON-LD only where it describes visible content. Dynamic
exercise pages are expanded at build time, so core instructions and internal
links exist without JavaScript.

Brand, color, canonical origin, social image, and advertisement flags are kept
in `src/config/site.ts`. Change branding there first, then audit visible copy,
SVG assets, the web manifest, metadata, and legal pages. `WorkoutMatch` is a
working name; this repository does not establish trademark or domain clearance.

The localization seam is in `src/config/i18n.ts`, but only English is complete.
It currently returns unprefixed English routes and `en`/`x-default` hreflang
links. Before publishing another locale, add complete translated UI and content,
locale-aware routing and canonicals, metadata, sitemap entries, and tests. Do not
publish an incomplete `/ms/` or other translated route merely because the type
or message dictionary was extended.

## Security, CSP, ads, and offline behavior

Astro's security configuration generates a hash-based page CSP for the scripts,
styles, and JSON-LD actually present in the build. The base directives restrict
resources to the same origin, disallow objects, and set `connect-src 'none'`.
`SeoHead.astro` registers JSON-LD hashes with Astro rather than weakening the
policy with unrestricted inline script execution.

Zod is configured in `src/lib/validation/zod.ts` with `jitless: true` before
schemas are created. This prevents its optional dynamic-code optimization from
probing `eval` under the strict CSP; do not remove that setting unless the CSP
and representative browser consoles have been re-audited.

`public/_headers` is copied to the production artifact for hosts that implement
Netlify/Cloudflare-style header files. It supplies MIME-sniffing, clickjacking,
referrer, permissions, cross-origin-opener, frame-ancestor, and immutable asset
cache policies. The header-level `frame-ancestors` policy supplements the
generated page CSP; it is not a replacement for it.

After adding any script, media type, font, analytics, embed, or external service:

1. justify why it is needed and document the privacy boundary;
2. update the real Astro CSP and host headers narrowly;
3. build and inspect the generated CSP rather than pasting a theoretical policy;
4. test every affected route on the actual deployment host;
5. confirm calculator values, generator constraints, imported data, local
   history, and free text never enter telemetry or ad targeting.

The reusable `AdSlot.astro` hook is disabled by `SITE_CONFIG.ads.enabled: false`.
No ad network, fake ad, analytics script, or consent platform is included.
Changing the boolean alone is not an advertising integration; real advertising
requires a separate CSP, privacy/consent, placement, accessibility, policy, and
performance review.

`public/site.webmanifest` uses `display: "browser"`. There is no service worker,
offline cache, or offline/PWA claim. Static pages may remain in an ordinary
browser cache, but the product must not be marketed as offline-capable.

## Testing and release QA

Unit coverage is organized by stable boundary:

- `calculators.test.ts`: formulas, categories, conversions, and validation;
- `exercise-data.test.ts`: schema, uniqueness, prescriptions, coverage, and
  cross-references;
- `generator.test.ts`: determinism, constraints, balance, duration, lock,
  replacement, impossible states, and share privacy;
- `storage.test.ts`: strict parsing, migrations, merge/replace, IndexedDB
  failures, export, and import safety.

Playwright runs mobile and desktop Chromium projects. Its specs cover navigation,
theme persistence, no-JavaScript content, 404 behavior, full/quick generation,
locks and replacement, safe sharing, calculator workflows, exercise filters,
progress export/import/clear, guided mode, representative console errors,
320-pixel overflow, and axe scans of key routes and states.

Automated tests do not replace manual review. Before a production release:

1. Run `npm run verify` from a clean install.
2. Confirm `PUBLIC_SITE_URL` appears correctly in canonicals, Open Graph,
   `robots.txt`, and the sitemap in `dist/`.
3. Inspect the built home, generator, workout result, guided mode, calculator,
   exercise index/detail, progress page, curated workouts, and 404.
4. Keyboard-test the skip link, navigation, forms, dialogs, filter controls,
   lock states, and player. In guided mode, Space starts/pauses, Left/Right move
   between intervals, and M toggles cues when focus is not in a control.
5. Test at 320 CSS pixels, at 200% zoom, with a coarse pointer, in light/dark
   themes, and with reduced motion enabled.
6. Check visible focus, dialog focus restoration, error-summary links, live
   regions, timer announcements, contrast, and touch-target size manually.
7. Test IndexedDB blocked/unavailable behavior and import rejection, merge,
   confirmed replacement, export, and clear-all in a real browser.
8. Verify print output for a workout and calculator result.
9. Inspect browser console/network activity and the deployed response headers.
10. Run `npm audit` and review findings deliberately; do not hide a finding or
    apply a breaking automatic fix without testing.

## Deployment

For every host, build with the production canonical origin and base path, then
publish `dist/`:

```sh
PUBLIC_SITE_URL=https://www.example.com npm run build
```

PowerShell:

```powershell
$env:PUBLIC_SITE_URL = 'https://www.example.com'
$env:PUBLIC_BASE_PATH = '/'
npm run build
```

Use Node 22.12 or newer in the build environment. After deployment, verify the
custom 404, trailing-slash routes, sitemap, robots output, canonical URLs, CSP,
and security headers against the public URL.

### Cloudflare Pages

Use these project settings:

- Framework preset: Astro, or none with the explicit settings below.
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 22.12 or newer
- Environment variable: `PUBLIC_SITE_URL=https://your-production-domain`

Cloudflare Pages understands the deployed `_headers` file. Confirm the actual
responses after adding a custom domain; dashboard rules can add or override
headers.

### Netlify

Use:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 22.12 or newer, through the project environment or the
  `package.json` engine
- Environment variable: `PUBLIC_SITE_URL=https://your-production-domain`

Netlify understands the deployed `_headers` file. Check that the generated 404
is served with a real 404 status and that no platform CSP setting conflicts with
the build-generated policy.

### GitHub Pages

The checked-in `.github/workflows/deploy.yml` is configured for this repository:

- Origin: `https://overloadcoder-dev.github.io`
- Base path: `/WorkoutMatch`
- Public URL: `https://overloadcoder-dev.github.io/WorkoutMatch/`

No Actions variable is required. A push to `main` runs static checks, unit
tests, a production build, and browser/accessibility coverage against the
project-site path before deploying `dist/`. If the repository is renamed or a
custom domain is added, update `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` in the
workflow together.

GitHub Pages does not apply the Netlify/Cloudflare `_headers` file. If the full
response-header policy is required, place a configurable CDN/proxy in front of
Pages or choose a host with static-header support; the generated page CSP still
applies in compatible browsers.

## Content and dependency maintenance

- Keep health-context sources in `src/data/citations.ts` and exercise references
  in the authoritative exercise entries.
- Update a source-check date only after opening and reviewing the current source.
- Prefer official public-health sources and original papers for health and
  formula claims. Separate sourced facts from product heuristics.
- Never invent medical review, endorsements, licenses, testimonials, ratings,
  outcomes, or calorie-burn precision.
- Review `npm outdated` and `npm audit` periodically. Confirm updated framework
  APIs against official documentation, keep the lockfile committed, and run
  `npm run verify` after dependency changes.
- Inspect generated HTML and client assets after Astro, Tailwind, CSP, or build
  integration updates.
- Preserve the privacy allowlists when changing share URLs, imports, logging,
  analytics, or deployment monitoring.

## Known limitations and non-goals

- The product is English-only.
- It provides single sessions, not personalized multi-week periodization.
- It is not built for children, pregnancy/postpartum programming, injury
  rehabilitation, competitive athletes, or medical treatment.
- It cannot observe technique, symptoms, fatigue, room safety, equipment
  installation, heart rate, or repetitions.
- BMI, BMR, and TDEE are simplified adult estimates, not measurements or
  individualized nutrition advice.
- Browser-local history is device/profile-specific and is not automatically
  backed up or synchronized.
- The exercise library currently provides text instructions only.
- There are no accounts, backend, Firebase, cloud sync, AI-generated plans,
  camera analysis, wearable integration, social features, payments, calorie-burn
  estimates, meal plans, body-weight charts, or real advertising.
- There is no service worker or guaranteed offline mode.
- GitHub Pages project-subpath deployment needs the base-path work described
  above; the current workflow deliberately rejects a subpath origin.
- No repository license file is included; do not assume redistribution rights
  without guidance from the project owner.
