// Renders the profile trophy SVG.
//
// Upstream (ryo-ma/github-profile-trophy) ships its own render_svg.ts and a
// composite action wrapping it, but both hardcode maxColumn = -1, which puts
// every trophy on a single row. GitHub then scales that wide image down to the
// README column width, so each trophy ends up much smaller than the vercel API
// used to render it. This script is upstream's renderer with the grid values
// the vercel API defaulted to (CONSTANTS.DEFAULT_MAX_COLUMN / _ROW).
//
// The workflow checks upstream out at ../../.trophy-src, so these imports use
// its current code rather than a stale fork.

import { GithubApiService } from "../../.trophy-src/src/Services/GithubApiService.ts";
import { Card } from "../../.trophy-src/src/card.ts";
import { COLORS } from "../../.trophy-src/src/theme.ts";

const MAX_COLUMN = 8;
const MAX_ROW = 3;
const PANEL_SIZE = 115;
const MARGIN_WIDTH = 10;
const MARGIN_HEIGHT = 10;

const username = Deno.args[0];
const outputPath = Deno.args[1];

if (!username || !outputPath) {
  console.error("Usage: render-trophy.ts USERNAME OUTPUT_PATH");
  Deno.exit(1);
}

if (!Deno.env.get("GITHUB_TOKEN1")) {
  console.error("GITHUB_TOKEN1 is required");
  Deno.exit(1);
}

const userInfo = await new GithubApiService().requestUserInfo(username);

// requestUserInfo resolves to a ServiceError instead of throwing.
// deno-lint-ignore no-explicit-any
if (!userInfo || (userInfo as any).totalCommits === undefined) {
  console.error(`Failed to fetch user info for ${username}:`, userInfo);
  Deno.exit(2);
}

const card = new Card(
  [],
  [],
  MAX_COLUMN,
  MAX_ROW,
  PANEL_SIZE,
  MARGIN_WIDTH,
  MARGIN_HEIGHT,
  false,
  false,
);

// deno-lint-ignore no-explicit-any
const svg = card.render(userInfo as any, COLORS.default);

await Deno.writeTextFile(outputPath, svg);
console.log(`Wrote ${outputPath} (${MAX_COLUMN} columns, max ${MAX_ROW} rows)`);
