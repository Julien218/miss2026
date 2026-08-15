import { syncDropboxMedia } from "./dropbox-sync";

let timerStarted = false;
let intervalHandle: NodeJS.Timeout | null = null;
let initialHandle: NodeJS.Timeout | null = null;

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function startDropboxLowCostAutoSync() {
  if (process.env.DROPBOX_SYNC_ENABLED !== "true") return;
  if (timerStarted || process.env.NODE_ENV !== "production") return;

  timerStarted = true;

  // Shared-link scans are relatively expensive because Dropbox requires walking
  // the folder tree. Default to one scan per hour instead of every 10 minutes.
  // Both values remain configurable from Railway without another deployment.
  const intervalMinutes = Math.max(
    15,
    positiveNumber(process.env.DROPBOX_SYNC_INTERVAL_MINUTES, 60)
  );
  const initialDelaySeconds = Math.max(
    30,
    positiveNumber(process.env.DROPBOX_SYNC_INITIAL_DELAY_SECONDS, 120)
  );

  const run = () =>
    syncDropboxMedia().catch(error =>
      console.warn(
        "[Dropbox Sync]",
        error instanceof Error ? error.message : String(error)
      )
    );

  console.info(
    `[Dropbox Sync] low-cost scheduler actif · toutes les ${intervalMinutes} min · premier passage dans ${initialDelaySeconds}s`
  );

  initialHandle = setTimeout(run, initialDelaySeconds * 1_000);
  intervalHandle = setInterval(run, intervalMinutes * 60_000);
}

export function stopDropboxLowCostAutoSync() {
  if (initialHandle) clearTimeout(initialHandle);
  if (intervalHandle) clearInterval(intervalHandle);
  initialHandle = null;
  intervalHandle = null;
  timerStarted = false;
}
