import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    testDir: './tests/e2e',
    testMatch: ['settings-integration.spec.mjs', 'pdf-integration.spec.mjs', 'platform-integration.spec.mjs', 'payments-integration.spec.mjs', 'quotes-integration.spec.mjs'],
    workers: 1,
    timeout: 45_000,
    use: { baseURL: 'http://127.0.0.1:4176', channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || undefined, viewport: { width: 375, height: 812 }, trace: 'retain-on-failure' },
    webServer: [
        { command: 'venv/bin/python tests/serve_settings_e2e.py', cwd: fileURLToPath(new URL('../backend', import.meta.url)), url: 'http://127.0.0.1:8002/', reuseExistingServer: false },
        { command: 'npm run dev -- --host 127.0.0.1 --port 4176 --strictPort --force', url: 'http://127.0.0.1:4176', reuseExistingServer: false, env: { VITE_API_BASE_URL: 'http://127.0.0.1:8002' } },
    ],
});
