import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    testIgnore: ['settings-integration.spec.mjs', 'pdf-integration.spec.mjs', 'platform-integration.spec.mjs', 'payments-integration.spec.mjs', 'quotes-integration.spec.mjs', 'followups-integration.spec.mjs', 'items-integration.spec.mjs'],
    fullyParallel: true,
    workers: 3,
    timeout: 90_000,
    use: {
        baseURL: 'http://127.0.0.1:4175',
        channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || undefined,
        trace: 'retain-on-failure',
    },
    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 4175 --strictPort --force',
        url: 'http://127.0.0.1:4175',
        reuseExistingServer: !process.env.CI,
        env: { VITE_API_BASE_URL: 'http://127.0.0.1:8000' },
    },
});
