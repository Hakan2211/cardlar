// Housekeeping: reclaim orphaned storage files and abandoned checkout rows.
//
//   node scripts/cleanup.mjs                    # dry run, production
//   node scripts/cleanup.mjs --apply            # actually delete
//   node scripts/cleanup.mjs --apply --dev      # against the dev deployment
//   node scripts/cleanup.mjs --days 60          # checkout age cutoff (def. 30)
//
// Dry run is the default everywhere. Nothing here can touch a paid card: the
// orphan sweep only deletes files no card references and that are at least 24h
// old, and the checkout prune only deletes unpaid pending_payment rows.
//
// The sweep looks at a bounded number of files per call so a single Convex
// transaction stays inside its read limits; this loops until there is nothing
// left to examine.

import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const DEV_URL = "https://quaint-mouse-314.eu-west-1.convex.cloud";
const PROD_URL = "https://artful-seal-643.eu-west-1.convex.cloud";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const useDev = args.includes("--dev");
const daysIndex = args.indexOf("--days");
const olderThanDays =
  daysIndex !== -1 && args[daysIndex + 1] ? Number(args[daysIndex + 1]) : 30;

if (!Number.isFinite(olderThanDays) || olderThanDays < 1) {
  console.error("--days must be a positive number");
  process.exit(1);
}

const BASE_URL = useDev ? DEV_URL : PROD_URL;
const client = new ConvexHttpClient(BASE_URL);
const dryRun = !apply;

console.log(`Deployment: ${BASE_URL}`);
console.log(dryRun ? "Mode: DRY RUN (pass --apply to delete)\n" : "Mode: APPLY\n");

// ── Orphaned storage files ────────────────────────────────────────────
console.log("Orphaned storage files");

let totalScanned = 0;
let totalOrphans = 0;
let totalMb = 0;
let totalReferenced = 0;
let totalTooNew = 0;
let round = 0;

// In apply mode each pass deletes what it finds, so the next pass sees fresh
// files; in dry run nothing changes, so one pass over the cap is all we can do
// without re-reporting the same files forever.
for (;;) {
  round += 1;
  const r = await client.mutation(anyApi.cleanup.sweepOrphanFiles, {
    dryRun,
    limit: 500,
  });

  totalScanned += r.scanned;
  totalOrphans += r.orphans;
  totalMb += r.megabytes;
  totalReferenced += r.referenced;
  totalTooNew += r.skippedTooNew;

  console.log(
    `  pass ${round}: scanned ${r.scanned}, in use ${r.referenced}, ` +
      `too new ${r.skippedTooNew}, orphaned ${r.orphans} (${r.megabytes} MB)`
  );

  if (!r.more) break;
  if (dryRun) {
    console.log("  (more files remain — run with --apply to work through them)");
    break;
  }
  if (round > 200) {
    console.log("  stopping after 200 passes; run again to continue");
    break;
  }
}

console.log(
  `  ${dryRun ? "would reclaim" : "reclaimed"} ${totalOrphans} file(s), ` +
    `${totalMb.toFixed(2)} MB  (${totalReferenced} in use, ${totalTooNew} inside the 24h grace window)\n`
);

// ── Abandoned checkouts ───────────────────────────────────────────────
console.log(`Abandoned checkouts (pending_payment, older than ${olderThanDays}d)`);

const prune = await client.mutation(anyApi.cleanup.pruneAbandonedCheckouts, {
  dryRun,
  olderThanDays,
});

console.log(
  `  ${prune.pendingTotal} pending row(s) total; ` +
    `${dryRun ? "would delete" : "deleted"} ${prune.deleted}`
);
if (prune.slugs.length > 0) {
  console.log(
    `  e.g. ${prune.slugs.join(", ")}${prune.deleted > prune.slugs.length ? ", ..." : ""}`
  );
}

console.log(
  dryRun
    ? "\nNothing was changed. Re-run with --apply to delete."
    : "\nDone."
);
