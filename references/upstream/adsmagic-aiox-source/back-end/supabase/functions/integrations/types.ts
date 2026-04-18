/**
 * Types for Integrations Edge Function
 */

export interface OAuthStartRequest {
  platform: 'meta' | 'google' | 'tiktok';
  redirectUri?: string; // Opcional: se não fornecido, usa variável de ambiente
}

export interface OAuthStartResponse {
  authUrl: string;
}

export interface OAuthCallbackRequest {
  accessToken: string; // For Meta: short-lived token; For Google: authorization code
  projectId?: string; // Opcional: fallback para casos de sessão perdida (extraído do state parameter)
  redirectUri?: string; // Required for Google OAuth code exchange
}

export interface OAuthCallbackResponse {
  success: boolean;
  integrationId: string;
  accounts: IntegrationAccountData[];
  error?: string;
}

export interface IntegrationAccountData {
  id: string;
  name: string;
  accountId: string;
  currency?: string;
  isManager?: boolean;
  parentMccId?: string;
  metadata: Record<string, unknown>;
}

export interface MetaUserData {
  id: string;
  name: string;
  email?: string;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  currency?: string;
}

export interface MetaTokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface GoogleTokenExchangeResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserData {
  id: string;
  name: string;
  email: string;
}

export interface GoogleAdAccount {
  id: string;
  name: string;
  customerId: string;
  currency?: string;
  isManager: boolean;
  parentMccId?: string;
}

export interface EncryptedToken {
  encrypted: string;
  expiresAt: string;
}

export interface SelectAccountsRequest {
  accountIds: string[];
  pixelId?: string;
  createPixel?: {
    name: string;
  };
}

export interface SelectAccountsResponse {
  success: boolean;
  integrationId: string;
  accountsCount: number;
  error?: string;
}

export interface Pixel {
  id: string;
  name: string;
  isCreated?: boolean;
}

export interface GetPixelsResponse {
  pixels: Pixel[];
}

export interface CreatePixelRequest {
  name: string;
  accountId: string;
}

export interface CreatePixelResponse {
  success: boolean;
  pixel: Pixel;
  error?: string;
}

export interface GoogleConversionAction {
  id: string;
  name: string;
  type?: string;
  status?: string;
  category?: string;
  primaryForGoal?: boolean;
  resourceName?: string;
}

export interface GetGoogleConversionActionsResponse {
  accountId: string;
  conversionActions: GoogleConversionAction[];
  selectedConversionActionIds: string[];
  enhancedConversionsForLeadsEnabled?: boolean;
  enhancedConversionsForLeadsCheckedAt?: string;
}

export interface SaveGoogleConversionActionsRequest {
  accountId: string;
  selectedConversionActionIds: string[];
  selectedConversionActions?: GoogleConversionAction[];
}

export interface SaveGoogleConversionActionsResponse {
  success: boolean;
  accountId: string;
  selectedCount: number;
}

export interface StartTagVerificationRequest {
  siteUrl: string;
}

export interface StartTagVerificationResponse {
  verificationId: string;
  verificationUrl: string;
  expiresAt: string;
  status: 'pending';
}

export interface TagVerificationStatusResponse {
  verificationId: string;
  status: 'pending' | 'verified' | 'expired' | 'failed';
  expiresAt: string;
  verifiedAt?: string;
  siteUrl: string;
  verifiedPageUrl?: string;
  errorMessage?: string;
  lastUpdatedAt?: string;
}

export interface TagVerificationPingRequest {
  token: string;
  projectId: string;
  pageUrl?: string;
  runtimeVersion?: string;
}
