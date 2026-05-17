"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type {
  CommandCenter,
  DashboardSummary,
  FinanceData,
  GamificationData,
  OnboardingData,
  PortfolioAsset,
  PortfolioHistoryPoint,
  RealEstateData,
  ScoreDetails,
  UserIntelligence,
  UserProfile,
} from "@/lib/types";

const emptyFinance: FinanceData = {
  revenus: [],
  charges: [],
  epargne: [],
  dettes: [],
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

export function useDashboard() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [score, setScore] = useState<number>(0);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [scoreAdvice, setScoreAdvice] = useState<string[]>([]);
  const [commandCenter, setCommandCenter] = useState<CommandCenter | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [realEstate, setRealEstate] = useState<RealEstateData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [intelligence, setIntelligence] = useState<UserIntelligence | null>(null);
  const [finance, setFinance] = useState<FinanceData>(emptyFinance);
  const [loading, setLoading] = useState(true);

  const applyUserProfile = useCallback((userData: UserProfile | null) => {
    setUser(userData);

    setOnboarding({
      revenus_mensuels: userData?.revenus_mensuels || 0,
      charges_mensuelles: userData?.charges_mensuelles || 0,
      profile_completed: userData?.profile_completed || false,
    });

    setDashboard({
      plan: userData?.plan || "FREE",
      level: userData?.level,
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

  const loadUserProfile = useCallback(async () => {
    const userData = await safeFetch<UserProfile>("/auth/me");
    applyUserProfile(userData);
    return userData;
  }, [applyUserProfile, safeFetch]);

  const loadGamification = useCallback(async () => {
    const data = await safeFetch<GamificationData>("/gamification");
    setGamification(data);
  }, [safeFetch]);

  const loadFinance = useCallback(async () => {
    const data = await safeFetch<Partial<FinanceData>>("/finance");
    setFinance({ ...emptyFinance, ...data });
  }, [safeFetch]);

  const loadPortfolio = useCallback(async () => {
    const data = await safeFetch<PortfolioResponse>("/portfolio");
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
    const data = await safeFetch<RealEstateData>("/real-estate");
    setRealEstate(data || { assets: [], totals: {} });
  }, [safeFetch]);

  const loadIntelligence = useCallback(async () => {
    const intel = await safeFetch<UserIntelligence & { onboarding?: OnboardingData }>(
      "/intelligence/user-intelligence"
    );

    setIntelligence(intel);
    return intel;
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
    const userData = await loadUserProfile();

    await Promise.all([
      loadPortfolio(),
      loadHistory(),
      loadRealEstate(),
      loadFinance(),
      loadOnboarding(userData),
      loadCommandCenter(),
      loadGamification(),
    ]);
  }, [
    loadCommandCenter,
    loadFinance,
    loadGamification,
    loadHistory,
    loadRealEstate,
    loadOnboarding,
    loadPortfolio,
    loadUserProfile,
  ]);

  const refreshAfterMutation = useCallback(async () => {
    try {
      await recalcScore();
    } catch (err) {
      console.error("SCORE RECALC ERROR:", err);
    }

    await refreshAll();
  }, [recalcScore, refreshAll]);

  useEffect(() => {
    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    const loadAll = async () => {
      try {
        const userData = await loadUserProfile();

        await loadCommandCenter();
        await Promise.all([
          loadPortfolio(),
          loadHistory(),
          loadRealEstate(),
          loadFinance(),
          loadOnboarding(userData),
          loadGamification(),
        ]);
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();

    const interval = setInterval(() => {
      refreshAll();
    }, 10000);

    return () => clearInterval(interval);
  }, [
    loadCommandCenter,
    loadFinance,
    loadGamification,
    loadHistory,
    loadRealEstate,
    loadOnboarding,
    loadPortfolio,
    loadUserProfile,
    refreshAll,
    token,
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
    onboarding,
    intelligence,
    finance,
    gamification,
    loadFinance,
    loadPortfolio,
    loadHistory,
    loadRealEstate,
    loadOnboarding,
    loadIntelligence,
    loadGamification,
    recalcScore,
    refreshAll,
    refreshAfterMutation,
    loading,
  };
}
