/**
 * Teste Spike - Vitest Browser Mode
 * 
 * Valida se o Vitest Browser Mode resolve o problema de conectividade
 * do Playwright no Windows.
 * 
 * Vitest Browser Mode executa testes no navegador diretamente,
 * sem precisar de conexão HTTP externa.
 */
import { describe, it, expect } from 'vitest';

describe('Spike: Vitest Browser Mode', () => {
    it('deve executar no contexto do navegador', () => {
        // Vitest Browser Mode executa diretamente no navegador
        // window e document estão disponíveis
        expect(typeof window).toBe('object');
        expect(typeof document).toBe('object');

        console.log('✅ Vitest rodando no navegador!');
        console.log('User Agent:', navigator.userAgent);
    });

    it('deve acessar DOM do navegador', () => {
        // Cria elemento para testar
        const div = document.createElement('div');
        div.id = 'spike-test';
        div.textContent = 'Spike funcionou!';
        document.body.appendChild(div);

        // Verifica que foi adicionado
        const found = document.getElementById('spike-test');
        expect(found).not.toBeNull();
        expect(found?.textContent).toBe('Spike funcionou!');

        // Limpa
        found?.remove();

        console.log('✅ Manipulação de DOM funcionou!');
    });

    it('deve ter acesso ao localStorage', () => {
        // Testa storage API
        localStorage.setItem('spike-test', 'funcionou');
        const value = localStorage.getItem('spike-test');
        expect(value).toBe('funcionou');
        localStorage.removeItem('spike-test');

        console.log('✅ localStorage funcionou!');
    });
});
