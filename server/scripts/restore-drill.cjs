const { spawnSync } = require('node:child_process');
const { mkdtempSync, unlinkSync, rmdirSync, existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { Client } = require('pg');
function connection(name) {
  const value = process.env[name];
  if (!value) throw new Error(name + ' is required');
  return new URL(value);
}
function pgEnvironment(url) {
  return { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432', PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGSSLMODE: url.searchParams.get('sslmode') || 'prefer' };
}
function run(command, args, url) {
  const result = spawnSync(command, args, { env: pgEnvironment(url), stdio: 'pipe' });
  if (result.error || result.status !== 0) throw new Error(command + ' failed (credentials omitted)');
}
async function fingerprint(client) {
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  const result = {};
  for (const { tablename } of tables.rows) {
    const escaped = '"' + tablename.replaceAll('"', '""') + '"';
    const value = await client.query(`SELECT count(*)::text AS count, md5(coalesce(string_agg(row_hash, '' ORDER BY row_hash), '')) AS hash FROM (SELECT md5(row_to_json(t)::text) AS row_hash FROM public.${escaped} t) rows`);
    result[tablename] = value.rows[0];
  }
  return result;
}
async function main() {
  const source = connection('BACKUP_DATABASE_URL'), target = connection('RESTORE_DATABASE_URL');
  if (!target.pathname.endsWith('_restore_drill') || (source.hostname === target.hostname && source.port === target.port && source.pathname === target.pathname)) throw new Error('Use a separate *_restore_drill database');
  const sourceClient = new Client({ connectionString: source.toString() }), targetClient = new Client({ connectionString: target.toString() });
  const dir = mkdtempSync(join(tmpdir(), 'compus-drill-'));
  const start = Date.now();
  try {
    await sourceClient.connect(); await targetClient.connect();
    const populated = await targetClient.query("SELECT count(*)::int AS count FROM pg_tables WHERE schemaname = 'public'");
    if (populated.rows[0].count) throw new Error('Restore target must be empty');
    const before = await fingerprint(sourceClient);
    const file = join(dir, 'backup.dump');
    run('pg_dump', ['--format=custom', '--no-owner', '--no-acl', '--file', file], source);
    run('pg_restore', ['--exit-on-error', '--no-owner', '--no-acl', '--dbname', decodeURIComponent(target.pathname.slice(1)), file], target);
    const after = await fingerprint(targetClient);
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Restored row counts/checksums do not match');
    console.log(JSON.stringify({ passed: true, tablesVerified: Object.keys(after).length, recoverySeconds: (Date.now() - start) / 1000 }));
  } finally {
    await Promise.allSettled([sourceClient.end(), targetClient.end()]);
    const backupFile = join(dir, 'backup.dump');
    if (existsSync(backupFile)) unlinkSync(backupFile);
    rmdirSync(dir);
  }
}
main().catch(() => { console.error('Restore drill failed; check isolated target and PostgreSQL tools. Credentials omitted.'); process.exitCode = 1; });
