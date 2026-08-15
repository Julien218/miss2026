import { syncDropboxMedia } from "./dropbox-sync";

let timerStarted = false;
let weeklyHandle: NodeJS.Timeout | null = null;

function nextWednesdayEvening(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).filter(p => p.type !== "literal").map(p => [p.type, p.value]));
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = weekdays.indexOf(parts.weekday);
  const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  let daysAhead = (3 - currentDay + 7) % 7;
  if (daysAhead === 0 && currentMinutes >= 20 * 60) daysAhead = 7;

  const baseUtc = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + daysAhead, 20, 0, 0));
  const probeFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const probe = Object.fromEntries(probeFormatter.formatToParts(baseUtc).filter(p => p.type !== "literal").map(p => [p.type, p.value]));
  const representedUtc = Date.UTC(Number(probe.year), Number(probe.month) - 1, Number(probe.day), Number(probe.hour), Number(probe.minute), Number(probe.second));
  return new Date(baseUtc.getTime() - (representedUtc - baseUtc.getTime()));
}

export function startDropboxLowCostAutoSync() {
  if (process.env.DROPBOX_SYNC_ENABLED !== "true") return;
  if (timerStarted || process.env.NODE_ENV !== "production") return;
  timerStarted = true;

  const scheduleNext = () => {
    if (!timerStarted) return;
    const target = nextWednesdayEvening();
    const delay = Math.max(1_000, target.getTime() - Date.now());
    console.info(`[Dropbox Sync] scheduler économique actif · prochain passage mercredi 20:00 Europe/Brussels · ${target.toISOString()}`);
    weeklyHandle = setTimeout(async () => {
      try {
        await syncDropboxMedia();
      } catch (error) {
        console.warn("[Dropbox Sync]", error instanceof Error ? error.message : String(error));
      } finally {
        scheduleNext();
      }
    }, delay);
  };

  scheduleNext();
}

export function stopDropboxLowCostAutoSync() {
  if (weeklyHandle) clearTimeout(weeklyHandle);
  weeklyHandle = null;
  timerStarted = false;
}
