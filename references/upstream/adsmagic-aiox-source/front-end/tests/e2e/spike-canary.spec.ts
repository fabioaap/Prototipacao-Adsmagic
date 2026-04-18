/**
 * Teste Canário - Valida que Playwright consegue conectar ao servidor
 * 
 * Este teste é usado no spike técnico para verificar se o workaround
 * de usar Vite Preview funciona no Windows.
 */
import { test, expect } from '@playwright/test';

test.describe('Spike: Conectividade Playwright + Vite Preview', () => {
    test('deve conectar ao servidor na porta 4173', async ({ page }) => {
        // Tenta navegar para o servidor preview
        const response = await page.goto('http://localhost:4173/', {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        // Verifica que a conexão foi estabelecida
        expect(response).not.toBeNull();
        expect(response?.status()).toBeLessThan(400);

        console.log('✅ Conexão estabelecida com sucesso!');
        console.log(`Status: ${response?.status()}`);
    });

    test('deve carregar a página inicial', async ({ page }) => {
        await page.goto('http://localhost:4173/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        // Verifica que algum conteúdo foi renderizado
        const body = await page.locator('body');
        await expect(body).toBeVisible();

        // Tira screenshot para evidência
        await page.screenshot({ path: 'spike-canary-screenshot.png' });

        console.log('✅ Página carregada com sucesso!');
    });
});
