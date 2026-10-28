import { defineConfig } from '@playwright/test';
import path from 'node:path';

const origin = process.env.ORBIT_HOMOLOG_FRONTEND;
if (process.env.ORBIT_HOMOLOGATION !== 'local-isolated'
    || !origin || new URL(origin).hostname !== '127.0.0.1'
    || !process.env.ORBIT_HOMOLOG_OUTPUT) {
    throw new Error('Execute pelo script de homologação local do backend.');
}
export default defineConfig({
    testDir: './tests/homologation',
    workers: 1,
    retries: 0,
    timeout: 45_000,
    reporter: [['list'], ['json', { outputFile: path.join(process.env.ORBIT_HOMOLOG_OUTPUT, 'browser.json') }]],
    outputDir: path.join(process.env.ORBIT_HOMOLOG_OUTPUT, 'browser-results'),
    use: { baseURL: origin, channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || undefined,
        trace: 'off', screenshot: 'off', video: 'off' },
});
