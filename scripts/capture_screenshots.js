import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const targets = [
  { name: '01_storefront_home.png', url: 'http://localhost:5173/' },
  { name: '02_smart_setup_builder.png', url: 'http://localhost:5173/#/build-setup' },
  { name: '03_admin_dashboard.png', url: 'http://localhost:5173/#/admin' },
  { name: '04_product_comparison.png', url: 'http://localhost:5173/#/comparison' },
  { name: '05_store_pickup_locator.png', url: 'http://localhost:5173/#/stores' },
];

targets.forEach((t) => {
  const dest = path.join(outDir, t.name);
  console.log(`Capturing ${t.name} from ${t.url}...`);
  try {
    execSync(
      `"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=3500 --window-size=1440,900 --screenshot="${dest}" "${t.url}"`,
      { stdio: 'pipe', timeout: 20000 }
    );
    if (fs.existsSync(dest)) {
      console.log(`✓ Saved ${t.name} (${fs.statSync(dest).size} bytes)`);
    } else {
      console.log(`Failed to generate ${t.name}`);
    }
  } catch (err) {
    console.error(`Error capturing ${t.name}:`, err.message);
  }
});
