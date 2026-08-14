# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is `haru/haru` — the GitHub **profile README repository** for the user `haru` (Haruyuki Iida). GitHub renders the root `README.md` on https://github.com/haru. There is no application code, no build system, no tests, and no package manager: the only "source" file that a human edits is `README.md`.

## The two layers

**1. Hand-edited: `README.md` (root)**

The profile page itself. It composes third-party badge/card services rendered as images:

- `komarev.com/ghpvc` (profile view counter), `img.shields.io` (follower count), `badgen.org/img/zenn` (Zenn article count for `haru_iida`)
- `github-profile-summary-cards.vercel.app/api/cards/...` — the **live API** variants of the summary cards, with `username=haru`. Note the productive-time card passes `utcOffset=9` (JST); keep that if the card is regenerated or moved.
- `github-profile-trophy.vercel.app`
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

## Working here

- Bot commits land directly on `main`, so `git pull` before editing to avoid conflicting with an overnight run.
- `tmp/` is gitignored and is the scratch area in this repo.
- Verify README changes by previewing the rendered markdown; the image URLs are live services and can be opened directly in a browser to check a query-param change before committing.
