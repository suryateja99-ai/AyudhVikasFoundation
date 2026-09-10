import { spawn } from 'child_process';

function run(label, cmd, args) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: false });
  child.on('exit', (code) => {
    console.log(`[${label}] exited ${code}`);
    process.exit(code ?? 1);
  });
  return child;
}

const api = run('api', process.execPath, [
  '--watch',
  '--watch-path=server/index.js',
  '--watch-path=server/db.js',
  '--watch-path=server/rbac.js',
  '--watch-path=server/validation.js',
  '--watch-path=server/email.js',
  '--watch-path=server/sms.js',
  '--watch-path=server/notifications.js',
  '--watch-path=server/migrations.js',
  '--watch-path=server/crypto-auth.js',
  '--watch-path=server/seed.js',
  '--watch-path=server/load-env.js',
  'server/index.js',
]);
const web = run('web', process.execPath, ['node_modules/vite/bin/vite.js', '--port=3000', '--host=0.0.0.0']);

function shutdown() {
  api.kill();
  web.kill();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
