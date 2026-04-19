/**
 * Configuração do Vitest Browser Mode
 * 
 * Spike: Testando se resolve problema de conectividade no Windows
 * 
 * Vitest Browser Mode gerencia o Vite dev server internamente,
 * o que deveria eliminar o ERR_CONNECTION_REFUSED.
 */
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        name: 'browser',
        include: ['tests/browser/**/*.test.ts'],
        browser: {
            enabled: true,
            provider: 'playwright',
            name: 'chromium',
            headless: process.env.CI === 'true',
        },
    },
});
