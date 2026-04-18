import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for GitHub automation scripts
 */
export default defineConfig({
    testDir: '../.github/scripts',
    testMatch: '*.spec.ts',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: 'list',

    use: {
        baseURL: 'https://github.com',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // Use stored auth if available
        storageState: process.env.PLAYWRIGHT_AUTH_FILE,
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Allow accessing GitHub
                permissions: ['clipboard-read', 'clipboard-write'],
            },
        },
    ],

    // Local dev server not needed for GitHub automation
    webServer: undefined,
});
