import { cleanupDuplicateDropboxPhotos, syncDropboxMedia } from "./dropbox-sync";

let timerStarted = false;
let weeklyHandle: NodeJS.Timeout | null = null;
let retryHandle: NodeJS.Timeout | null = null;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DEFAULT_TIMEZONE = "Europe/Brussels";
const DEFAULT_WEEKDAY = 3; // Wednesday
const DEFAULT_HOUR = 20;
const DEFAULT_MINUTE = 0;
const RETRY_DELAY_MS = 30 * 60_000;

function boundedInt(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function scheduleConfig() {
  return {
    timezone: process.env.DROPBOX_SYNC_TIMEZONE || DEFAULT_TIMEZONE,
    weekday: boundedInt(process.env.DROPBOX_SYNC_WEEKDAY, DEFAULT_WEEKDAY, 0, 6),
    hour: boundedInt(process.env.DROPBOX_SYNC_HOUR_LOCAL, DEFAULT_HOUR, 0, 23),
    minute: boundedInt(process.env.DROPBOX_SYNC_MINUTE_LOCAL, DEFAULT_MINUTE, 0, 59),
  };
}

function localParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return Object.fromEntries(
    formatter.formatToParts(date)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  ) as Record<string, string>;
}

function zonedLocalTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
) {
  const approximateUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const probe = localParts(approximateUtc, timeZone);
  const representedUtc = Date.UTC(
    Number(probe.year),
    Number(probe.month) - 1,
    Number(probe.day),
    Number(probe.hour),
    Number(probe.minute),
    Number(probe.second)
  );
  const offsetMs = representedUtc - approximateUtc.getTime();
  return new Date(approximateUtc.getTime() - offsetMs);
}

function nextWeeklyRun(now = new Date()) {
  const { timezone, weekday, hour, minute } = scheduleConfig();
  const current = localParts(now, timezone);
  const currentWeekday = WEEKDAYS.indexOf(current.weekday as typeof WEEKDAYS[number]);
  const currentMinutes = Number(current.hour) * 60 + Number(current.minute);
  const targetMinutes = hour * 60 + minute;

  let daysAhead = (weekday - currentWeekday + 7) % 7;
  if (daysAhead === 0 && currentMinutes >= targetMinutes) daysAhead = 7;

  const targetDate = new Date(Date.UTC(
    Number(current.year),
    Number(current.month) - 1,
    Number(current.day) + daysAhead,
    12,
    0,
    0
  ));
  return zonedLocalTimeToUtc(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth() + 1,
    targetDate.getUTCDate(),
    hour,
    minute,
    timezone
  );
}

export function startDropboxLowCostAutoSync() {
  if (process.env.DROPBOX_SYNC_ENABLED !== "true") return;
  if (timerStarted || process.env.NODE_ENV !== "production") return;
  timerStarted = true;

  cleanupDuplicateDropboxPhotos()
    .then(result => console.info(`[Dropbox Cleanup] ${result.deleted} doublon(s) supprimé(s) dans ${result.groups} groupe(s)${result.alreadyApplied ? " · déjà appliqué" : ""}`))
    .catch(error => console.warn("[Dropbox Cleanup]", error instanceof Error ? error.message : String(error)));

  const config = scheduleConfig();

  const scheduleNext = () => {
    if (!timerStarted) return;
    const target = nextWeeklyRun();
    const delay = Math.max(1_000, target.getTime() - Date.now());
    console.info(
      `[Dropbox Sync] scheduler économique actif · ${WEEKDAYS[config.weekday]} ${String(config.hour).padStart(2, "0")}:${String(config.minute).padStart(2, "0")} ${config.timezone} · prochain passage ${target.toISOString()}`
    );

    weeklyHandle = setTimeout(async () => {
      try {
        const result = await syncDropboxMedia();
        console.info(`[Dropbox Sync] synchronisation hebdomadaire terminée · ${result.summary}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[Dropbox Sync] synchronisation hebdomadaire échouée:", message);

        // One delayed retry only. This avoids a full week of stale media after a
        // transient Dropbox/Railway outage without recreating a costly polling loop.
        retryHandle = setTimeout(() => {
          retryHandle = null;
          syncDropboxMedia().catch(retryError =>
            console.warn(
              "[Dropbox Sync] tentative de secours échouée:",
              retryError instanceof Error ? retryError.message : String(retryError)
            )
          );
        }, RETRY_DELAY_MS);
      } finally {
        scheduleNext();
      }
    }, delay);
  };

  scheduleNext();
}

export function stopDropboxLowCostAutoSync() {
  if (weeklyHandle) clearTimeout(weeklyHandle);
  if (retryHandle) clearTimeout(retryHandle);
  weeklyHandle = null;
  retryHandle = null;
  timerStarted = false;
}
