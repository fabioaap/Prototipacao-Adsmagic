/**
 * Configurações do Backend - Adsmagic First AI
 * 
 * Este arquivo contém as configurações base para o backend,
 * incluindo URLs, chaves e configurações de ambiente.
 * 
 * ⚠️ IMPORTANTE: Nunca commitar secrets ou chaves reais.
 * Use variáveis de ambiente para dados sensíveis.
 * 
 * Variáveis de ambiente obrigatórias:
 * - SUPABASE_URL: URL do projeto Supabase
 * - SUPABASE_ANON_KEY: Chave anônima (obtenha em Settings → API no Dashboard)
 * - SUPABASE_SERVICE_ROLE_KEY: Chave service-role (apenas para operações administrativas)
 */

export interface BackendConfig {
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  
  // Cloudflare Workers Configuration
  workers: {
    analyticsUrl?: string;
    integrationsUrl?: string;
    messagingUrl?: string;
  };
  
  // Database Configuration
  database: {
    maxConnections: number;
    connectionTimeout: number;
    queryTimeout: number;
  };
  
  // Security Configuration
  security: {
    enableRLS: boolean;
    enableAudit: boolean;
    maxRetries: number;
  };
  
  // Performance Configuration
  performance: {
    cacheTimeout: number;
    batchSize: number;
    enableCompression: boolean;
  };
  
  // Meta OAuth Configuration
  meta: {
    oauth: {
      apiVersion: string;
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      scope: string;
    };
  };
}

/**
 * Configuração de desenvolvimento (mock-first)
 */
export const devConfig: BackendConfig = {
  supabase: {
    url: process.env.SUPABASE_URL || 'https://nitefyufrzytdtxhaocf.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    // serviceRoleKey deve vir de variável de ambiente
  },
  
  workers: {
    // URLs dos workers serão configuradas após deploy
    analyticsUrl: undefined,
    integrationsUrl: undefined,
    messagingUrl: undefined,
  },
  
  database: {
    maxConnections: 10,
    connectionTimeout: 30000,
    queryTimeout: 60000,
  },
  
  security: {
    enableRLS: true,
    enableAudit: true,
    maxRetries: 3,
  },
  
  performance: {
    cacheTimeout: 300000, // 5 minutos
    batchSize: 100,
    enableCompression: true,
  },
  
  meta: {
    oauth: {
      apiVersion: 'v23.0',
      clientId: '1014767140181992',
      clientSecret: process.env.META_OAUTH_CLIENT_SECRET || '',
      redirectUri: 'http://localhost:5173/auth/oauth/callback',
      scope: 'ads_read,business_management,ads_management',
    },
  },
};

/**
 * Configuração de produção
 */
export const prodConfig: BackendConfig = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  workers: {
    analyticsUrl: process.env.WORKER_ANALYTICS_URL,
    integrationsUrl: process.env.WORKER_INTEGRATIONS_URL,
    messagingUrl: process.env.WORKER_MESSAGING_URL,
  },
  
  database: {
    maxConnections: 50,
    connectionTimeout: 30000,
    queryTimeout: 120000,
  },
  
  security: {
    enableRLS: true,
    enableAudit: true,
    maxRetries: 5,
  },
  
  performance: {
    cacheTimeout: 600000, // 10 minutos
    batchSize: 500,
    enableCompression: true,
  },
  
  meta: {
    oauth: {
      apiVersion: process.env.META_OAUTH_API_VERSION || 'v23.0',
      clientId: process.env.META_OAUTH_CLIENT_ID || '',
      clientSecret: process.env.META_OAUTH_CLIENT_SECRET || '',
      redirectUri: process.env.META_OAUTH_REDIRECT_URI || '',
      scope: process.env.META_OAUTH_SCOPE || 'ads_read,business_management,ads_management',
    },
  },
};

/**
 * Configuração ativa baseada no ambiente
 */
export const config: BackendConfig = process.env.NODE_ENV === 'production' 
  ? prodConfig 
  : devConfig;

/**
 * Validação da configuração
 */
export function validateConfig(config: BackendConfig): void {
  if (!config.supabase.url) {
    throw new Error('SUPABASE_URL é obrigatória');
  }
  
  if (!config.supabase.anonKey) {
    throw new Error('SUPABASE_ANON_KEY é obrigatória');
  }
  
  if (config.security.enableRLS && !config.supabase.serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY não configurada - RLS pode não funcionar corretamente');
  }
}

/**
 * Inicialização da configuração
 */
export function initializeConfig(): BackendConfig {
  validateConfig(config);
  console.log('✅ Configuração do backend inicializada');
  return config;
}

// Exportar configuração inicializada
export default initializeConfig();
