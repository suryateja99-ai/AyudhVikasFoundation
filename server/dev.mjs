import { spawn } from 'child_process';

function run(label, cmd, args) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
  child.on('exit', (code) => {
    console.log(`[${label}] exited ${code}`);
    process.exit(code ?? 1);
  });
  return child;
}

const api = run('api', 'node', ['--watch', 'server/index.js']);
const web = run('web', 'node', ['node_modules/vite/bin/vite.js', '--port=3000', '--host=0.0.0.0']);

function shutdown() {
  api.kill();
  web.kill();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
