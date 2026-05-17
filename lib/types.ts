export type FinanceType = "revenus" | "charges" | "epargne" | "dettes";

export type FinanceEntry = {
  id: number;
  type?: FinanceType | string;
  name?: string;
  label?: string;
  amount?: number | string;
};

export type FinancePayload = {
  type: FinanceType;
  name: string;
  amount: number;
};

export type FinanceData = Record<FinanceType, FinanceEntry[]>;

export type PortfolioAsset = {
  id: number;
  asset_name?: string;
  name?: string;
  asset_type?: string;
  type?: string;
  quantity?: number | string;
  purchase_price?: number | string;
  current_price?: number | string;
  value?: number | string;
  current_value?: number | string;
  cost?: number | string;
  gain?: number | string;
  gain_percent?: number | string;
  ticker?: string;
  source?: string;
};

export type PortfolioPayload = {
  asset_name: string;
  asset_type: string;
  quantity: number;
  purchase_price: number;
};

export type PortfolioHistoryPoint = {
  date?: string;
  created_at?: string;
  value?: number | string;
  cost?: number | string;
  gain?: number | string;
};

export type ScoreDetails = {
  wealth?: number;
  diversification?: number;
  debt?: number;
  debt_risk_score?: number;
  activity?: number;
};

export type CommandCenter = {
  global_score?: number;
  level?: string;
  family_office_score?: {
    details?: ScoreDetails;
  };
  advice?: string[];
  modules?: Record<string, { score?: number }>;
  onboarding?: OnboardingData;
};

export type OnboardingData = {
  revenus_mensuels?: number;
  charges_mensuelles?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  profile_completed?: boolean;
};

export type UserProfile = OnboardingData & {
  id?: number;
  email?: string;
  plan?: string;
  level?: string;
};

export type GamificationData = {
  xp?: number;
  level?: number | string;
  streak?: number;
  badges?: string[];
  ai_coach?: { message?: string };
  reward?: { title?: string; description?: string };
  notification?: { title?: string; message?: string };
};

export type DashboardSummary = {
  plan?: string;
  level?: string;
};
