import { afterEach, describe, expect, it, vi } from 'vitest';
import { registrationHandler, validIntegrationToken, readRegistrationPage, REGISTRATIONS_SQL } from './_core/cockpit-registrations';
import mysql from 'mysql2/promise';

vi.mock('mysql2/promise', () => ({ default: { createConnection: vi.fn() } }));
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
const secret = 's'.repeat(64);
function response() {
  const res: any = { code: 200, body: null, headers: {} };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  res.status = (n: number) => { res.code = n; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  return res;
}
describe('Liaison Cockpit lecture seule', () => {
  it.each([undefined, '', 'Bearer wrong', 'Bearer '])('refuse les requêtes non autorisées %s', async header => {
    vi.stubEnv('COCKPIT_REGISTRATIONS_TOKEN', secret);
    const read = vi.fn(); const res = response();
    await registrationHandler(read)({ get: () => header, query: {} } as any, res);
    expect(res.code).toBe(401); expect(read).not.toHaveBeenCalled();
    expect(res.headers['Cache-Control']).toBe('private, no-store');
  });
  it('refuse un secret serveur absent ou trop court', () => {
    expect(validIntegrationToken('Bearer ', '')).toBe(false);
    expect(validIntegrationToken('Bearer short', 'short')).toBe(false);
    expect(validIntegrationToken(`Bearer ${secret}`, secret)).toBe(true);
  });
  it('valide le curseur avant de lire la base', async () => {
    vi.stubEnv('COCKPIT_REGISTRATIONS_TOKEN', secret);
    const read = vi.fn(); const res = response();
    await registrationHandler(read)({ get: () => `Bearer ${secret}`, query: { cursor: "' OR 1=1" } } as any, res);
    expect(res.code).toBe(400); expect(read).not.toHaveBeenCalled();
  });
  it('renvoie une erreur, jamais une fausse liste vide, si MySQL échoue', async () => {
    vi.stubEnv('COCKPIT_REGISTRATIONS_TOKEN', secret);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const read = vi.fn().mockRejectedValue(Object.assign(new Error('password=sensitive'), { code: 'ER_ACCESS_DENIED_ERROR' }));
    const res = response();
    await registrationHandler(read)({ get: () => `Bearer ${secret}`, query: {} } as any, res);
    expect(res.code).toBe(503); expect(JSON.stringify(res.body)).not.toContain('sensitive');
    expect(res.body.records).toBeUndefined();
  });
  it('pagination sans écriture et sans sélection de secrets', async () => {
    vi.stubEnv('DATABASE_URL', 'mysql://unused');
    const rows = Array.from({ length: 201 }, (_, index) => ({ id: `candidate:${String(index + 1).padStart(10, '0')}` }));
    const query = vi.fn().mockResolvedValue([rows]); const end = vi.fn();
    vi.mocked(mysql.createConnection).mockResolvedValue({ query, end } as any);
    const result = await readRegistrationPage('');
    expect(result.records).toHaveLength(200);
    expect(result.nextCursor).toBe('candidate:0000000200');
    expect(end).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledWith(expect.objectContaining({ sql: REGISTRATIONS_SQL }), ['']);
    expect(REGISTRATIONS_SQL).not.toMatch(/password|token|dateOfBirth|ipAddress|profilePhoto|\b(INSERT|UPDATE|DELETE)\b/i);
    expect(REGISTRATIONS_SQL).toContain('NOT EXISTS');
    expect(REGISTRATIONS_SQL.match(/t.year = 2026/g)).toHaveLength(2);
  });
  it('ferme la connexion même si la requête échoue', async () => {
    vi.stubEnv('DATABASE_URL', 'mysql://unused');
    const end = vi.fn();
    vi.mocked(mysql.createConnection).mockResolvedValue({ query: vi.fn().mockRejectedValue(new Error('db')), end } as any);
    await expect(readRegistrationPage('')).rejects.toThrow('db'); expect(end).toHaveBeenCalledOnce();
  });
});
