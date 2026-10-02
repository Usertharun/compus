import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const checks = [
  ['Repository tests', 'npm', ['test']],
  ['Repository lint', 'npm', ['run', 'lint']],
  ['Frontend production build', 'npm', ['run', 'build']],
  ['Prisma schema and client', 'npm', ['--prefix', 'server', 'run', 'prisma:generate']],
  ['Backend production build', 'npm', ['--prefix', 'server', 'run', 'build']],
  ['Backend tests', 'npm', ['--prefix', 'server', 'test', '--', '--runInBand']],
];

const requiredFiles = [
  '.github/workflows/ci.yml',
  '.github/workflows/production-health.yml',
  '.github/workflows/restore-drill.yml',
  'server/prisma/migrations/20261002020000_launch/migration.sql',
  'server/prisma/migrations/20261002021000_object_storage/migration.sql',
  'server/scripts/load-test.cjs',
  'server/scripts/restore-drill.cjs',
  'server/scripts/migrate-images.ts',
  'server/scripts/cloudinary-smoke.ts',
  'server/scripts/image-migration-status.ts',
  'src/pages/Privacy/index.tsx',
];

let failed = false;
for (const file of requiredFiles) {
  const passed = existsSync(file);
  console.log(`${passed ? 'PASS' : 'FAIL'} required file: ${file}`);
  failed ||= !passed;
}

for (const [name, command, args] of checks) {
  console.log(`\n--- ${name} ---`);
  const windows = process.platform === 'win32';
  const executable = windows ? (process.env.ComSpec || 'cmd.exe') : command;
  const executableArgs = windows ? ['/d', '/s', '/c', [command, ...args].join(' ')] : args;
  const result = spawnSync(executable, executableArgs, { stdio: 'inherit' });
  const passed = result.status === 0;
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  failed ||= !passed;
  if (!passed) break;
}

const deploymentGroups = {
  'Cloudinary image storage': ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
  'Sentry alerts': ['SENTRY_DSN'],
  'Production health alert': ['COMPUS_HEALTH_URL'],
};
console.log('\n--- External rollout configuration ---');
for (const [name, variables] of Object.entries(deploymentGroups)) {
  const configured = variables.every(variable => Boolean(process.env[variable]));
  console.log(`${configured ? 'READY' : 'PENDING'} ${name} (${variables.join(', ')})`);
}
console.log('External credentials are checked by presence only and are never printed.');

if (failed) process.exitCode = 1;
else console.log('\nLocal public-launch preflight passed. Complete the live gates in LAUNCH_OPERATIONS.md before launch.');
