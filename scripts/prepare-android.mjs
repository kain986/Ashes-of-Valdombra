// Prepara il progetto Android generato da Capacitor:
// schermo intero, numero di versione e permessi minimi.
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const cfg = JSON.parse(readFileSync('capacitor.config.json', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const appDir = join('android', 'app');
if (!existsSync(appDir)) {
  console.error('Cartella android/ assente: esegui prima "npx cap add android".');
  process.exit(1);
}

// 1. Attività a schermo intero
const javaDir = join(appDir, 'src', 'main', 'java', ...cfg.appId.split('.'));
copyFileSync(join('native', 'android', 'MainActivity.java'), join(javaDir, 'MainActivity.java'));

// 2. Versione: in CI arriva dalle variabili d'ambiente, in locale da package.json
const versionCode = parseInt(process.env.VERSION_CODE || '1', 10);
const versionName = (process.env.VERSION_NAME || pkg.version).replace(/^v/, '');
const gradlePath = join(appDir, 'build.gradle');
let gradle = readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode \d+/, `versionCode ${versionCode}`)
               .replace(/versionName "[^"]*"/, `versionName "${versionName}"`);
writeFileSync(gradlePath, gradle);

// 3. Il gioco funziona offline: nessun permesso oltre a quelli di base
const manifestPath = join(appDir, 'src', 'main', 'AndroidManifest.xml');
let manifest = readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android:screenOrientation')) {
  manifest = manifest.replace('<activity', '<activity\n            android:screenOrientation="fullSensor"');
}
writeFileSync(manifestPath, manifest);

console.log(`Progetto Android pronto: ${cfg.appName} ${versionName} (${versionCode})`);
