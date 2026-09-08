import { mkdirSync, createWriteStream, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const PACKAGES = [
  'pg@8.16.3',
  'pg-pool@3.10.1',
  'pg-connection-string@2.9.1',
  'pg-protocol@1.10.3',
  'pg-types@2.2.0',
  'pgpass@1.0.5',
  'pg-cloudflare@1.2.7',
  'split2@4.2.0',
  'postgres-array@2.0.0',
  'postgres-bytea@1.0.0',
  'postgres-date@1.0.7',
  'postgres-interval@1.2.0',
  'pg-int8@1.0.1',
  'xtend@4.0.2',
];

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function vendorOne(spec) {
  const at = spec.lastIndexOf('@');
  const name = spec.slice(0, at);
  const version = spec.slice(at + 1);
  const encoded = name.replace('/', '%2f');
  const meta = await (await fetch(`https://registry.npmjs.org/${encoded}/${version}`)).json();
  const tarball = meta.dist.tarball;
  const dest = join('node_modules', name);
  const tmp = join('vendor', `${name.replace('/', '-')}-${version}.tgz`);
  mkdirSync('vendor', { recursive: true });
  mkdirSync('node_modules', { recursive: true });
  const res = await fetch(tarball);
  if (!res.ok) throw new Error(`Failed ${tarball}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp));
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  await run('tar', ['-xzf', tmp, '-C', dest, '--strip-components=1']);
  console.log('vendored', spec);
}

for (const spec of PACKAGES) {
  await vendorOne(spec);
}
console.log('pg driver vendored into node_modules');
