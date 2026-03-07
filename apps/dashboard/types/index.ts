export interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  lastLogin: string;
  org: Organization;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  status: string;
  settings: BotSettings;
  plan?: Plan;
}

export interface BotSettings {
  primaryColor: string;
  welcomeMessage: string;
  botName: string;
  position: string;
  showBranding: boolean;
}

export interface Plan {
  name: string;
  limits: PlanLimits;
}

export interface PlanLimits {
  monthly_visitors: number;
  monthly_conversations: number;
  kb_size_mb: number;
  api_calls: number;
  custom_domain: boolean;
  remove_branding: boolean;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
  chunkCount: number;
  tokenCount: number;
  sourceUrl?: string;
  errorMsg?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  organization: Organization;
  tokens: AuthTokens;
}