"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, clearAuthSession, isJwtExpired } from "@/lib/api";
import type {
  CommandCenter,
  CategoryOpportunityData,
  DashboardSummary,
  FinanceData,
  GamificationData,
  LegacyOverview,
  OnboardingData,
  PortfolioAsset,
  PortfolioHistoryPoint,
  ProductContext,
  RealEstateData,
  ScoreDetails,
  UserIntelligence,
  UserProfile,
  VentureAssetData,
  WorkspaceData,
  YieldAssetData,
} from "@/lib/types";

const emptyFinance: FinanceData = {
  revenus: [],
  charges: [],
  epargne: [],
  dettes: [],
};

const DASHBOARD_LIVE_REFRESH_MS = 60_000;
const DASHBOARD_SESSION_CACHE_PREFIX = "whiteRockDashboardSession:";

type BillingSubscription = {
  plan?: string;
  status?: string;
  founder?: {
    is_founder?: boolean;
    tier?: string | null;
    discount?: number;
  };
};

type PortfolioResponse =
  | PortfolioAsset[]
  | {
      portfolio?: PortfolioAsset[] | { assets?: PortfolioAsset[] };
      assets?: PortfolioAsset[];
      data?: PortfolioAsset[] | { portfolio?: PortfolioAsset[]; assets?: PortfolioAsset[] };
      items?: PortfolioAsset[];
      results?: PortfolioAsset[];
    };

type DashboardSessionSnapshot = {
  user: UserProfile | null;
  dashboard: DashboardSummary | null;
  score: number;
  scoreDetails: ScoreDetails | null;
  scoreAdvice: string[];
  commandCenter: CommandCenter | null;
  gamification: GamificationData | null;
  portfolio: PortfolioAsset[];
  history: PortfolioHistoryPoint[];
  realEstate: RealEstateData | null;
  yieldAssets: YieldAssetData | null;
  ventureAssets: VentureAssetData | null;
  onboarding: OnboardingData | null;
  intelligence: UserIntelligence | null;
  categoryOpportunities: CategoryOpportunityData | null;
  workspaces: WorkspaceData | null;
  legacyOverview: LegacyOverview | null;
  product: ProductContext | null;
  finance: FinanceData;
};

const extractPortfolio = (data: PortfolioResponse | null) => {
  if (Array.isArray(data)) return data;
  if (!data) return null;

  const nestedPortfolio =
    !Array.isArray(data.portfolio) && data.portfolio?.assets
      ? data.portfolio.assets
      : null;

  const nestedData =
    !Array.isArray(data.data) && data.data
      ? data.data.portfolio || data.data.assets
      : null;

  const candidates = [
    data.portfolio,
    data.assets,
    data.data,
    data.items,
    data.results,
    nestedPortfolio,
    nestedData,
  ];

  return candidates.find(Array.isArray) || null;
};

const readCachedDashboard = (): DashboardSummary | null => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem("whiteRockDashboard");
    return cached ? (JSON.parse(cached) as DashboardSummary) : null;
  } catch {
    return null;
  }
};

const getDashboardSessionCacheKey = (token: string | null) =>
  token ? `${DASHBOARD_SESSION_CACHE_PREFIX}${token.slice(-24)}` : null;

const readCachedDashboardSession = (
  token: string | null
): DashboardSessionSnapshot | null => {
  if (typeof window === "undefined") return null;

  const cacheKey = getDashboardSessionCacheKey(token);
  if (!cacheKey) return null;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    return cached ? (JSON.parse(cached) as DashboardSessionSnapshot) : null;
  } catch {
    return null;
  }
};

const cacheDashboardSession = (
  token: string | null,
  snapshot: DashboardSessionSnapshot
) => {
  if (typeof window === "undefined") return;

  const cacheKey = getDashboardSessionCacheKey(token);
  if (!cacheKey) return;

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(snapshot));
  } catch {
    // Session cache is a UX acceleration only. Backend data remains authoritative.
  }
};

const cacheDashboard = (dashboardData: DashboardSummary) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("whiteRockDashboard", JSON.stringify(dashboardData));
};

const preserveHighestDashboard = (
  current: DashboardSummary | null,
  next: DashboardSummary
) => {
  return {
    plan: next.plan || current?.plan,
    level: next.level || current?.level,
    next_plan: next.next_plan ?? current?.next_plan,
    is_founder: next.is_founder ?? current?.is_founder,
    founder_tier: next.founder_tier ?? current?.founder_tier,
    founder_discount: next.founder_discount ?? current?.founder_discount,
  };
};

export function useDashboard() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(
    readCachedDashboard
  );
  const [score, setScore] = useState<number>(0);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [scoreAdvice, setScoreAdvice] = useState<string[]>([]);
  const [commandCenter, setCommandCenter] = useState<CommandCenter | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [realEstate, setRealEstate] = useState<RealEstateData | null>(null);
  const [yieldAssets, setYieldAssets] = useState<YieldAssetData | null>(null);
  const [ventureAssets, setVentureAssets] = useState<VentureAssetData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [intelligence, setIntelligence] = useState<UserIntelligence | null>(null);
  const [categoryOpportunities, setCategoryOpportunities] =
    useState<CategoryOpportunityData | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceData | null>(null);
  const [legacyOverview, setLegacyOverview] = useState<LegacyOverview | null>(null);
  const [product, setProduct] = useState<ProductContext | null>(null);
  const [finance, setFinance] = useState<FinanceData>(emptyFinance);
  const [loading, setLoading] = useState(true);

  const applyUserProfile = useCallback((userData: UserProfile | null) => {
    if (!userData) return;

    setUser(userData);

    setOnboarding({
      revenus_mensuels: userData?.revenus_mensuels || 0,
      charges_mensuelles: userData?.charges_mensuelles || 0,
      profile_completed: userData?.profile_completed || false,
    });

    setDashboard((current) => {
      const nextDashboard = preserveHighestDashboard(current, {
        plan: userData.plan,
        level: userData.level,
        is_founder: userData.is_founder,
        founder_tier: userData.founder_tier,
        founder_discount: userData.founder_discount,
      });
      cacheDashboard(nextDashboard);
      return nextDashboard;
    });
  }, []);

  const safeFetch = useCallback(
    async <T,>(url: string): Promise<T | null> => {
      if (!token) return null;

      try {
        return await apiRequest<T>(url, token);
      } catch {
        return null;
      }
    },
    [token]
  );

  const applyDashboardSession = useCallback((snapshot: DashboardSessionSnapshot) => {
    setUser(snapshot.user);
    setDashboard(snapshot.dashboard);
    setScore(snapshot.score);
    setScoreDetails(snapshot.scoreDetails);
    setScoreAdvice(snapshot.scoreAdvice);
    setCommandCenter(snapshot.commandCenter);
    setGamification(snapshot.gamification);
    setPortfolio(snapshot.portfolio);
    setHistory(snapshot.history);
    setRealEstate(snapshot.realEstate);
    setYieldAssets(snapshot.yieldAssets);
    setVentureAssets(snapshot.ventureAssets);
    setOnboarding(snapshot.onboarding);
    setIntelligence(snapshot.intelligence);
    setCategoryOpportunities(snapshot.categoryOpportunities);
    setWorkspaces(snapshot.workspaces);
    setLegacyOverview(snapshot.legacyOverview);
    setProduct(snapshot.product);
    setFinance(snapshot.finance);
  }, []);

  const loadUserProfile = useCallback(async () => {
    const userData = await safeFetch<UserProfile>("/auth/me");
    applyUserProfile(userData);
    return userData;
  }, [applyUserProfile, safeFetch]);

  const loadGamification = useCallback(async () => {
    const data = await safeFetch<GamificationData>("/gamification/");
    setGamification(data);
  }, [safeFetch]);

  const loadProductContext = useCallback(async () => {
    const data = await safeFetch<ProductContext>("/product/context");
    if (data) {
      setProduct(data);
      if (data.plan) {
        setDashboard((current) => {
          const nextDashboard = {
            plan: data.plan,
            level: data.progression?.level || current?.level,
            next_plan: data.next_plan ?? current?.next_plan,
            is_founder: data.founder?.is_founder ?? current?.is_founder,
            founder_tier: data.founder?.tier ?? current?.founder_tier,
            founder_discount: data.founder?.discount ?? current?.founder_discount,
          };
          cacheDashboard(nextDashboard);
          return nextDashboard;
        });
      }
    }
  }, [safeFetch]);

  const loadBillingSubscription = useCallback(async () => {
    const data = await safeFetch<BillingSubscription>("/billing/current-subscription");
    if (data?.plan) {
      setDashboard((current) => {
        const nextDashboard = preserveHighestDashboard(current, {
          plan: data.plan,
          is_founder: data.founder?.is_founder,
          founder_tier: data.founder?.tier,
          founder_discount: data.founder?.discount,
        });
        cacheDashboard(nextDashboard);
        return nextDashboard;
      });
    }
    return data;
  }, [safeFetch]);

  const loadWorkspaces = useCallback(async () => {
    const data = await safeFetch<WorkspaceData>("/workspaces/");
    setWorkspaces(data || { workspaces: [] });

    if (
      typeof window !== "undefined" &&
      data?.active_workspace_id &&
      !localStorage.getItem("activeWorkspaceId")
    ) {
      localStorage.setItem("activeWorkspaceId", String(data.active_workspace_id));
    }
  }, [safeFetch]);

  const loadLegacyOverview = useCallback(async () => {
    const data = await safeFetch<LegacyOverview>("/legacy/overview");
    setLegacyOverview(data);
  }, [safeFetch]);

  const loadFinance = useCallback(async () => {
    const data = await safeFetch<Partial<FinanceData>>("/finance/");
    setFinance({ ...emptyFinance, ...data });
  }, [safeFetch]);

  const loadPortfolio = useCallback(async () => {
    const data = await safeFetch<PortfolioResponse>("/portfolio/");
    const nextPortfolio = extractPortfolio(data);

    if (nextPortfolio) {
      setPortfolio(nextPortfolio);
    }
  }, [safeFetch]);

  const loadHistory = useCallback(async () => {
    const data = await safeFetch<{ history?: PortfolioHistoryPoint[] }>(
      "/portfolio/history"
    );
    setHistory(data?.history || []);
  }, [safeFetch]);

  const loadRealEstate = useCallback(async () => {
    const data = await safeFetch<RealEstateData>("/real-estate/");
    setRealEstate(data || { assets: [], totals: {} });
  }, [safeFetch]);

  const loadYieldAssets = useCallback(async () => {
    const data = await safeFetch<YieldAssetData>("/yield-assets/");
    setYieldAssets(data || { assets: [], totals: {} });
  }, [safeFetch]);

  const loadVentureAssets = useCallback(async () => {
    const data = await safeFetch<VentureAssetData>("/venture-assets/");
    setVentureAssets(data || { assets: [], totals: {} });
  }, [safeFetch]);

  const loadIntelligence = useCallback(async () => {
    const intel = await safeFetch<UserIntelligence & { onboarding?: OnboardingData }>(
      "/intelligence/user-intelligence"
    );

    setIntelligence(intel);
    return intel;
  }, [safeFetch]);

  const loadCategoryOpportunities = useCallback(async () => {
    const data = await safeFetch<CategoryOpportunityData>(
      "/intelligence/category-opportunities"
    );
    setCategoryOpportunities(data || { categories: [] });
  }, [safeFetch]);

  const loadOnboarding = useCallback(async (fallbackUser: UserProfile | null = null) => {
    const intel = await loadIntelligence();

    setOnboarding(
      intel?.onboarding || {
        revenus_mensuels: fallbackUser?.revenus_mensuels || 0,
        charges_mensuelles: fallbackUser?.charges_mensuelles || 0,
      }
    );
  }, [loadIntelligence]);

  const recalcScore = useCallback(async () => {
    if (!token) return;

    const data = await apiRequest<{
      score?: number;
      details?: ScoreDetails;
      advice?: string[];
    }>("/intelligence/score/recalculate", token, {
      method: "POST",
    });

    setScore(Number(data.score) || 0);
    setScoreDetails(data.details || null);
    setScoreAdvice(data.advice || []);
  }, [token]);

  const loadCommandCenter = useCallback(async () => {
    const data = await safeFetch<CommandCenter>(
      "/intelligence/global-command-center"
    );

    if (!data) return;

    setCommandCenter(data);
    setScore(Number(data.global_score || 0));
    setScoreDetails(data.family_office_score?.details || null);
    setScoreAdvice(data.advice || []);
  }, [safeFetch]);

  const refreshAll = useCallback(async () => {
    await loadBillingSubscription();
    await loadProductContext();
    const userData = await loadUserProfile();

    await Promise.all([
      loadPortfolio(),
      loadWorkspaces(),
      loadLegacyOverview(),
      loadHistory(),
      loadRealEstate(),
      loadYieldAssets(),
      loadVentureAssets(),
      loadFinance(),
      loadCategoryOpportunities(),
      loadOnboarding(userData),
      loadCommandCenter(),
      loadGamification(),
    ]);
  }, [
    loadCommandCenter,
    loadFinance,
    loadCategoryOpportunities,
    loadGamification,
    loadHistory,
    loadLegacyOverview,
    loadRealEstate,
    loadYieldAssets,
    loadVentureAssets,
    loadOnboarding,
    loadPortfolio,
    loadBillingSubscription,
    loadProductContext,
    loadWorkspaces,
    loadUserProfile,
  ]);

  const refreshLive = useCallback(async () => {
    await Promise.all([
      loadBillingSubscription(),
      loadProductContext(),
      loadCommandCenter(),
      loadCategoryOpportunities(),
      loadGamification(),
    ]);
  }, [
    loadBillingSubscription,
    loadCategoryOpportunities,
    loadCommandCenter,
    loadGamification,
    loadProductContext,
  ]);

  const refreshAfterMutation = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!token || isJwtExpired(token)) {
      if (typeof window !== "undefined") {
        clearAuthSession();
        window.location.assign("/login?reason=session_expired");
      }
      return;
    }

    let cacheHydrationTimeout: ReturnType<typeof setTimeout> | null = null;
    const cachedSession = readCachedDashboardSession(token);
    if (cachedSession) {
      cacheHydrationTimeout = setTimeout(() => {
        applyDashboardSession(cachedSession);
        setLoading(false);
      }, 0);
    }

    const loadAll = async () => {
      try {
        await refreshAll();
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();

    let refreshInFlight = false;
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible" || refreshInFlight) return;

      refreshInFlight = true;
      refreshLive().finally(() => {
        refreshInFlight = false;
      });
    }, DASHBOARD_LIVE_REFRESH_MS);

    return () => {
      if (cacheHydrationTimeout) clearTimeout(cacheHydrationTimeout);
      clearInterval(interval);
    };
  }, [applyDashboardSession, refreshAll, refreshLive, token]);

  useEffect(() => {
    if (loading) return;

    cacheDashboardSession(token, {
      user,
      dashboard,
      score,
      scoreDetails,
      scoreAdvice,
      commandCenter,
      gamification,
      portfolio,
      history,
      realEstate,
      yieldAssets,
      ventureAssets,
      onboarding,
      intelligence,
      categoryOpportunities,
      workspaces,
      legacyOverview,
      product,
      finance,
    });
  }, [
    categoryOpportunities,
    commandCenter,
    dashboard,
    finance,
    gamification,
    history,
    intelligence,
    legacyOverview,
    loading,
    onboarding,
    portfolio,
    product,
    realEstate,
    score,
    scoreAdvice,
    scoreDetails,
    token,
    user,
    ventureAssets,
    workspaces,
    yieldAssets,
  ]);

  return {
    user,
    dashboard,
    score,
    scoreDetails,
    scoreAdvice,
    commandCenter,
    portfolio,
    history,
    realEstate,
    yieldAssets,
    ventureAssets,
    onboarding,
    intelligence,
    categoryOpportunities,
    workspaces,
    legacyOverview,
    product,
    finance,
    gamification,
    loadFinance,
    loadPortfolio,
    loadProductContext,
    loadWorkspaces,
    loadLegacyOverview,
    loadHistory,
    loadRealEstate,
    loadYieldAssets,
    loadVentureAssets,
    loadOnboarding,
    loadIntelligence,
    loadCategoryOpportunities,
    loadGamification,
    recalcScore,
    refreshAll,
    refreshAfterMutation,
    loading,
  };
}
