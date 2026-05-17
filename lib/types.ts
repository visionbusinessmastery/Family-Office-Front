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

export type RealEstateType = "primary_residence" | "flip" | "rental";

export type RealEstateAsset = {
  id: number;
  property_type: RealEstateType;
  name: string;
  purchase_price?: number | string;
  estimated_value?: number | string;
  resale_price?: number | string;
  monthly_rent?: number | string;
  monthly_charges?: number | string;
  target_value?: number | string;
  potential_gain?: number | string;
  potential_gain_percent?: number | string;
  annual_net_rent?: number | string;
  rental_yield?: number | string;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RealEstatePayload = {
  property_type: RealEstateType;
  name: string;
  purchase_price: number;
  estimated_value: number;
  resale_price: number;
  monthly_rent: number;
  monthly_charges: number;
  notes?: string | null;
};

export type RealEstateData = {
  assets: RealEstateAsset[];
  totals: {
    total_purchase?: number | string;
    total_estimated_value?: number | string;
    total_potential_gain?: number | string;
    total_potential_gain_percent?: number | string;
    average_rental_yield?: number | string;
  };
};

export type YieldAssetType = "crowdfunding" | "private_equity";

export type YieldAsset = {
  id: number;
  asset_type: YieldAssetType;
  name: string;
  principal?: number | string;
  average_rate?: number | string;
  duration_months?: number | string;
  projected_gain?: number | string;
  final_value?: number | string;
  notes?: string | null;
};

export type YieldAssetPayload = {
  asset_type: YieldAssetType;
  name: string;
  principal: number;
  average_rate: number;
  duration_months: number;
  notes?: string | null;
};

export type YieldAssetData = {
  assets: YieldAsset[];
  totals: {
    total_principal?: number | string;
    total_projected_gain?: number | string;
    total_final_value?: number | string;
    average_rate?: number | string;
  };
};

export type VentureAssetType = "ai_business" | "business" | "startup" | "franchise";

export type VentureAsset = {
  id: number;
  asset_type: VentureAssetType;
  name: string;
  revenue?: number | string;
  charges?: number | string;
  result?: number | string;
  fundraising?: number | string;
  debts?: number | string;
  valuation?: number | string;
  computed_value?: number | string;
  final_value?: number | string;
  notes?: string | null;
};

export type VentureAssetPayload = {
  asset_type: VentureAssetType;
  name: string;
  revenue: number;
  charges: number;
  fundraising: number;
  debts: number;
  valuation: number;
  notes?: string | null;
};

export type VentureAssetData = {
  assets: VentureAsset[];
  totals: {
    total_revenue?: number | string;
    total_charges?: number | string;
    total_result?: number | string;
    total_fundraising?: number | string;
    total_debts?: number | string;
    total_final_value?: number | string;
  };
};

export type Opportunity = {
  type?: string;
  title?: string;
  description?: string;
  priority?: "high" | "medium" | "low" | string;
  score?: number;
  premium?: boolean;
};

export type OpportunityData = {
  count?: number;
  opportunities?: Opportunity[];
  analytics?: {
    crypto_ratio?: number;
    asset_types_count?: number;
    portfolio_value?: number;
  };
};

export type UserIntelligence = {
  opportunities?: OpportunityData | Opportunity[];
  strategic_intelligence?: Record<string, unknown>;
  financial_features?: Record<string, unknown>;
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
  ai_coach?: {
    message?: string;
    affiliations?: Array<{
      title?: string;
      reason?: string;
      priority?: string;
    }>;
  };
  reward?: { title?: string; description?: string };
  notification?: { title?: string; message?: string };
};

export type DashboardSummary = {
  plan?: string;
  level?: string;
};
