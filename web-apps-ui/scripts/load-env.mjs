import { existsSync, readFileSync } from 'fs';

if (!existsSync('.env')) {
  process.exit(0);
}

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    continue;
  }

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) {
    continue;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim();
  if (key && process.env[key] === undefined) {
    process.env[key] = value;
  }
}
