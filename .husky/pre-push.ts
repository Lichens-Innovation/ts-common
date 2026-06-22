import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin });
const zero = '0000000000000000000000000000000000000000';
let hasTypeScriptChanges = false;

for await (const line of rl) {
  const [, localSha, , remoteSha] = line.trim().split(' ');
  const range = remoteSha === zero ? localSha : `${remoteSha}..${localSha}`;

  const result = spawnSync('git', ['diff', '--name-only', range], {
    encoding: 'utf8',
  });

  if (result.stdout.split('\n').some((f) => /\.(ts|tsx)$/.test(f))) {
    hasTypeScriptChanges = true;
    break;
  }
}

if (hasTypeScriptChanges) {
  const result = spawnSync('bun', ['run', 'test'], {
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
}
