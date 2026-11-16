const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profileDir = path.resolve(__dirname, '..', 'docs', 'screenshots', 'edge_profile');
const outDir = path.resolve(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pages = [
  { name: 'login', path: '/login' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'commercial', path: '/commercial' },
  { name: 'projects', path: '/projects' },
  { name: 'procurement', path: '/procurement' },
  { name: 'inventory', path: '/inventory' },
  { name: 'quality', path: '/quality' },
  { name: 'finance', path: '/finance' },
  { name: 'hr', path: '/hr' },
  { name: 'reports', path: '/reports' },
  { name: 'not_found', path: '/non-existing-page-404' },
];

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'tablet', width: 1024, height: 768 },
  { label: 'mobile', width: 390, height: 844 },
];

console.log('=== DÉBUT DE LA CAMPAGNE DE CAPTURE UI/UX DESKTOP / TABLETTE / MOBILE ===');

for (const p of pages) {
  for (const vp of viewports) {
    const filename = `${p.name}_${vp.label}.png`;
    const targetFile = path.join(outDir, filename);
    const url = `http://localhost:3001${p.path}`;
    
    console.log(`Capture ${filename} (${vp.width}x${vp.height}) -> ${url}...`);
    try {
      const cmd = `"${edgePath}" --headless=new --disable-gpu --no-sandbox --user-data-dir="${profileDir}" --virtual-time-budget=3000 --window-size=${vp.width},${vp.height} --screenshot="${targetFile}" "${url}"`;
      execSync(cmd, { stdio: 'pipe' });
      const stats = fs.statSync(targetFile);
      console.log(`  ✓ Enregistré : ${filename} (${stats.size} octets)`);
    } catch (err) {
      console.error(`  ✗ Erreur capture ${filename}:`, err.message);
    }
  }
}

console.log('\n=== CAMPAGNE DE CAPTURE TERMINÉE AVEC SUCCÈS ===');
