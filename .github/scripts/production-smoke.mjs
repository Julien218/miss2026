const base = process.env.MMD_BASE_URL || "https://missetmisterdour.be";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checks = [];
function record(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function request(path, options = {}) {
  return fetch(new URL(path, base), { redirect: "manual", ...options });
}

async function waitForReady() {
  let last = "";
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      const response = await request("/api/public/forms-health");
      const body = await response.text();
      last = `${response.status} ${body.slice(0, 240)}`;
      if (response.status === 200) {
        const json = JSON.parse(body);
        if (json.ok === true && json.database === true && json.adminsAvailable === true && json.storageConfigured === true) {
          record("Forms health", true, `DB=${json.database} admins=${json.adminsAvailable} storage=${json.storage}`);
          return;
        }
      }
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    console.log(`Production pas encore prête (${attempt}/30): ${last}`);
    await sleep(10_000);
  }
  record("Forms health", false, last);
}

await waitForReady();

const publicRoutes = [
  "/", "/about", "/candidates", "/ranking", "/gallery", "/sponsors", "/press", "/contact",
  "/inscription-candidat", "/inscription-merci", "/public", "/login",
  "/legal/cgu", "/legal/privacy", "/legal/cookies", "/mentions-legales",
  "/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/sw.js",
  "/logo/miss-mister-dour-logo-transparent.webp",
];

for (const path of publicRoutes) {
  try {
    const response = await request(path);
    record(`GET ${path}`, response.status >= 200 && response.status < 400, `HTTP ${response.status}`);
  } catch (error) {
    record(`GET ${path}`, false, error instanceof Error ? error.message : String(error));
  }
}

const redirects = [
  ["/intro", "/"],
  ["/miss-mister-dour-2026", "/about"],
  ["/miss-mister", "/candidates"],
  ["/video-factory", "/login?returnTo=/admin/video-generator"],
];
for (const [path, expected] of redirects) {
  try {
    const response = await request(path);
    const location = response.headers.get("location") || "";
    const ok = [301, 302, 307, 308].includes(response.status) && (location === expected || location.endsWith(expected));
    record(`Redirect ${path}`, ok, `HTTP ${response.status} → ${location}`);
  } catch (error) {
    record(`Redirect ${path}`, false, error instanceof Error ? error.message : String(error));
  }
}

const invalidPosts = [
  ["/api/public/contact", {}],
  ["/api/public/candidate-applications", {}],
];
for (const [path, payload] of invalidPosts) {
  try {
    const response = await request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    record(`Validation ${path}`, response.status === 400, `HTTP ${response.status} (aucune donnée créée)`);
  } catch (error) {
    record(`Validation ${path}`, false, error instanceof Error ? error.message : String(error));
  }
}

try {
  const response = await request("/sitemap.xml");
  const xml = await response.text();
  const required = ["/candidates", "/gallery", "/ranking", "/inscription-candidat", "/public"];
  record("Sitemap routes 2027", required.every((route) => xml.includes(route)), `${required.length} routes requises`);
} catch (error) {
  record("Sitemap routes 2027", false, error instanceof Error ? error.message : String(error));
}

try {
  const response = await request("/robots.txt");
  const text = await response.text();
  record("Robots espaces privés", text.includes("Disallow: /admin") && text.includes("Disallow: /login") && text.includes("Sitemap:"), "admin/login bloqués + sitemap déclaré");
} catch (error) {
  record("Robots espaces privés", false, error instanceof Error ? error.message : String(error));
}

const failed = checks.filter((check) => !check.ok);
console.log(`\nRecette: ${checks.length - failed.length}/${checks.length} contrôles réussis.`);
if (failed.length) {
  console.error("Contrôles en échec:", failed);
  process.exit(1);
}
