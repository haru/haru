# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is `haru/haru` — the GitHub **profile README repository** for the user `haru` (Haruyuki Iida). GitHub renders the root `README.md` on https://github.com/haru. There is no application code, no build system, no tests, and no package manager: the only "source" file that a human edits is `README.md`.

## The two layers

**1. Hand-edited: `README.md` (root)**

The profile page itself. It composes third-party badge/card services rendered as images:

- `komarev.com/ghpvc` (profile view counter), `img.shields.io` (follower count), `badgen.org/img/zenn` (Zenn article count for `haru_iida`)
- `github-profile-summary-cards.vercel.app/api/cards/...` — the **live API** variants of the summary cards, with `username=haru`. Note the productive-time card passes `utcOffset=9` (JST); keep that if the card is regenerated or moved.
- `images/trophy.svg` — a **committed** SVG, not a live URL. `github-profile-trophy.vercel.app` now returns HTTP 402 `DEPLOYMENT_DISABLED`, so the trophy is generated in CI instead (see below).
- `skillicons.dev/icons?i=...&theme=light` — the tech-stack icon row

Since the page is entirely remote images, "changing the profile" almost always means editing URLs/query params in this file, not writing code. The username `haru` is hard-coded in these URLs.

**2. Bot-generated: `profile-summary-card-output/` — do not hand-edit**

Entirely produced by the `vn7n24fzkq/github-profile-summary-cards` action. 65 theme directories, each containing the same five SVGs (`0-profile-details`, `1-repos-per-language`, `2-most-commit-language`, `3-stats`, `4-productive-time`) plus a per-theme `README.md` with copy-paste snippets, and a top-level `README.md` that previews every theme. Any manual change here is overwritten on the next scheduled run.

These committed SVGs are the *self-hosted* alternative to the vercel API URLs used in the root README. The root README currently uses the live API, so the checked-in SVGs are unused by the profile page itself — they exist as a theme gallery / fallback. If you switch the root README to the committed SVGs, use the `raw.githubusercontent.com/haru/haru/main/profile-summary-card-output/<theme>/N-*.svg` form shown in each theme's README.

## Generation workflow

`.github/workflows/profile-summary-cards.yml` runs the action on a schedule, on `create`, and via `workflow_dispatch`. Two things to know:

- It uses `secrets.PROFILE_CARDS` (a **personal access token**) as `GITHUB_TOKEN`, not the default workflow token. With the default token only the Top Languages card renders — this is called out in the generated `profile-summary-card-output/README.md`.
- The cron is written `* */24 * * *`, which is "every minute of hour 0", not "once every 24 hours". In practice GitHub throttles it down to roughly one run per day around 00:2x–00:4x UTC, which is why the history is a long run of daily `Generate profile summary cards` commits. Fix it to `0 0 * * *` if the intent matters.

To refresh cards on demand, trigger the workflow rather than running anything locally:

```sh
gh workflow run GitHub-Profile-Summary-Cards
gh run watch
```

`.github/workflows/trophy.yml` does the same job for the trophy: it runs a composite action (a Deno script, `render_svg.ts`) to write `images/trophy.svg`, then commits it. Same on-demand pattern:

```sh
gh workflow run GitHub-Profile-Trophy
gh run watch
```

It prefers `secrets.PROFILE_CARDS` and falls back to `secrets.GITHUB_TOKEN`.

The workflow does **not** use a published action. `ryo-ma/github-profile-trophy` has an `action.yml` on `master`, but it — like its `render_svg.ts` — hardcodes `maxColumn = -1`, putting every trophy on one row. The `Erik-Donath/github-profile-trophy@feature/generate-svg` fork the Zenn article recommends does expose `max-cols`/`max-rows`, but it is a stale April 2026 snapshot and now fails with `Error fetching user info` (exit 3) even with a valid token.

So the workflow checks upstream out at `.trophy-src` (gitignored, pinned via the `TROPHY_REF` env var) and runs `.github/scripts/render-trophy.ts`, a ~40-line copy of upstream's renderer that imports `src/card.ts` / `src/Services/GithubApiService.ts` from that checkout and sets the grid to 8 columns x 3 rows — `CONSTANTS.DEFAULT_MAX_COLUMN` / `DEFAULT_MAX_ROW`, i.e. what the vercel API rendered by default. Bump `TROPHY_REF` to take upstream changes; the only API the script depends on is `GithubApiService#requestUserInfo`, the `Card` constructor, and `Card#render`.

Sizing gotcha: the SVG's intrinsic width is `panel-size * cols + margin-width * (cols - 1)`, and GitHub scales the image down to the README column width (~890px). So **`panel-size` does not change the apparent size** — `max-cols` does. Fewer columns = larger trophies.

## Working here

- Bot commits land directly on `main`, so `git pull` before editing to avoid conflicting with an overnight run.
- `tmp/` is gitignored and is the scratch area in this repo.
- Verify README changes by previewing the rendered markdown; the image URLs are live services and can be opened directly in a browser to check a query-param change before committing.
