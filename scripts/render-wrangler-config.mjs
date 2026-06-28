import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const configPath = resolve(root, 'wrangler.jsonc');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

config.d1_databases = config.d1_databases || [];
if (!config.d1_databases[0]) {
  config.d1_databases[0] = { binding: 'DB', database_name: 'tempemail-db' };
}

const d1DatabaseId = process.env.D1_DATABASE_ID || process.env.CLOUDFLARE_D1_DATABASE_ID;
if (d1DatabaseId) {
  config.d1_databases[0].database_id = d1DatabaseId;
}
if (!config.d1_databases[0].database_id || config.d1_databases[0].database_id === 'REPLACE_WITH_D1_DATABASE_ID') {
  throw new Error('Missing D1 database_id in wrangler.jsonc or D1_DATABASE_ID.');
}
config.d1_databases[0].database_name = process.env.D1_DATABASE_NAME || config.d1_databases[0].database_name || 'tempemail-db';

config.vars = config.vars || {};
if (process.env.JWT_SECRET) {
  config.vars.JWT_SECRET = process.env.JWT_SECRET;
}
if (process.env.ADMIN_PASSWORD) {
  config.vars.ADMIN_PASSWORDS = [process.env.ADMIN_PASSWORD];
}
if (process.env.FRONTEND_URL) {
  config.vars.FRONTEND_URL = process.env.FRONTEND_URL;
}

writeFileSync(configPath, `${JSON.stringify(config, null, 2)}
`);
console.log(`Rendered ${configPath} for ${config.name} with D1 ${config.d1_databases[0].database_name}.`);
