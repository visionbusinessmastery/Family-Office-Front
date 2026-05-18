"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useDashboard } from "@/hooks/useDashboard";
import type {
  FinanceEntry,
  FinancePayload,
  PortfolioAsset,
  PortfolioPayload,
  RealEstateAsset,
  RealEstatePayload,
  RealEstateType,
  VentureAsset,
  VentureAssetPayload,
  VentureAssetType,
  YieldAsset,
  YieldAssetPayload,
  YieldAssetType,
} from "@/lib/types";

import Header from "@/components/dashboard/Header";
import AdvisorChat from "@/components/dashboard/AdvisorChat";
import ChartModule from "@/components/dashboard/ChartModule";
import ExposureBreakdown from "@/components/dashboard/ExposureBreakdown";
import FinanceModule from "@/components/dashboard/FinanceModule";
import OpportunitiesModule from "@/components/dashboard/OpportunitiesModule";
import PortfolioModule from "@/components/dashboard/PortfolioModule";
import ProductProgressPanel from "@/components/dashboard/ProductProgressPanel";
import RealEstateModule from "@/components/dashboard/RealEstateModule";
import VentureAssetsModule from "@/components/dashboard/VentureAssetsModule";
import YieldInvestmentsModule from "@/components/dashboard/YieldInvestmentsModule";
import WorkspacePanel from "@/components/dashboard/WorkspacePanel";
import FinanceBlock from "@/components/finance/FinanceBlock";
import GamificationPanel from "@/components/gamification/GamificationPanel";

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

type DashboardSection =
  | "home"
  | "finances"
  | "investments"
  | "real_estate"
  | "ventures"
  | "ai"
  | "progression"
  | "settings";

type NavigationItem = {
  key: DashboardSection;
  label: string;
  description: string;
  locked?: boolean;
};

function LockedSection({
  title,
  description,
  onUpgrade,
  plan = "gold",
}: {
  title: string;
  description: string;
  onUpgrade?: (plan: string) => void;
  plan?: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
          Module progressif
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          {description}
        </p>
        {onUpgrade && (
          <button
            onClick={() => onUpgrade(plan)}
            className="mt-5 rounded-xl bg-[#3fa9f5] px-4 py-2 text-sm font-semibold text-white"
          >
            Debloquer
          </button>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-400">
        {description}
      </p>
    </div>
  );
}

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const getAssetCost = (asset: PortfolioAsset) =>
  Number(
    asset.cost ??
      Number(asset.quantity || 0) * Number(asset.purchase_price || 0)
  );

const parsePositiveNumber = (value: string | null) => {
  if (value === null) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseNonNegativeNumber = (value: string | null) => {
  if (value === null) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const isRealEstatePortfolioType = (value: string) =>
  [
    "IMMOBILIER",
    "REAL_ESTATE",
    "REAL ESTATE",
    "IMMO",
    "CROWDFUNDING",
    "PRIVATE_EQUITY",
    "PRIVATE EQUITY",
    "AI_BUSINESS",
    "AI BUSINESS",
    "BUSINESS",
    "STARTUP",
    "FRANCHISE",
    "BANKING",
    "ENTREPRENEURSHIP",
    "MARKET",
  ].includes(
    value.trim().toUpperCase()
  );

export default function Dashboard() {
  const {
    dashboard,
    portfolio,
    history,
    realEstate,
    yieldAssets,
    ventureAssets,
    intelligence,
    categoryOpportunities,
    onboarding,
    finance,
    gamification,
    commandCenter,
    workspaces,
    product,
    refreshAll,
    refreshAfterMutation,
    loading,
  } = useDashboard();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [activeSection, setActiveSection] = useState<DashboardSection>("home");

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Chargement...
      </main>
    );
  }

  const globalScore = commandCenter?.global_score || 0;
  const scoreAdvice = commandCenter?.advice || [];
  const totalValue = portfolio.reduce(
    (acc, asset) => acc + getAssetValue(asset),
    0
  );
  const initialInvestment = portfolio.reduce(
    (acc, asset) => acc + getAssetCost(asset),
    0
  );
  const portfolioGain = totalValue - initialInvestment;
  const realEstateAssets = realEstate?.assets || [];
  const realEstateFinal = Number(realEstate?.totals?.total_estimated_value || 0);
  const realEstateGain = Number(realEstate?.totals?.total_potential_gain || 0);
  const yieldFinal = Number(yieldAssets?.totals?.total_final_value || 0);
  const yieldGain = Number(yieldAssets?.totals?.total_projected_gain || 0);
  const ventureFinal = Number(ventureAssets?.totals?.total_final_value || 0);
  const ventureGain = Number(ventureAssets?.totals?.total_result || 0);
  const globalPortfolioValue =
    totalValue + realEstateFinal + yieldFinal + ventureFinal;
  const globalPortfolioGain =
    portfolioGain + realEstateGain + yieldGain + ventureGain;
  const globalPortfolioInvested = globalPortfolioValue - globalPortfolioGain;
  const globalPortfolioGainClass =
    globalPortfolioGain >= 0 ? "text-emerald-400" : "text-red-400";
  const categoryCounts = [
    { label: "Assets financiers", value: portfolio.length },
    {
      label: "Forex",
      value: portfolio.filter(
        (asset) => String(asset.asset_type || asset.type).toUpperCase() === "FOREX"
      ).length,
    },
    { label: "Immobilier", value: realEstateAssets.length },
    { label: "Crowdfunding", value: (yieldAssets?.assets || []).filter((asset) => asset.asset_type === "crowdfunding").length },
    { label: "Private Equity", value: (yieldAssets?.assets || []).filter((asset) => asset.asset_type === "private_equity").length },
    { label: "Business", value: (ventureAssets?.assets || []).filter((asset) => asset.asset_type === "business").length },
    { label: "Startup", value: (ventureAssets?.assets || []).filter((asset) => asset.asset_type === "startup").length },
    { label: "Franchise", value: (ventureAssets?.assets || []).filter((asset) => asset.asset_type === "franchise").length },
    { label: "AI Business", value: (ventureAssets?.assets || []).filter((asset) => asset.asset_type === "ai_business").length },
  ].filter((item) => item.value > 0);
  const categoryOpportunityItems = categoryOpportunities?.categories || [];
  const findOpportunity = (key: string) =>
    categoryOpportunityItems.find((item) => item.key === key);
  const financialOpportunityKeys = [
    "stock",
    "stocks",
    "etf",
    "crypto",
    "commodities",
    "forex",
  ];
  const financialOpportunities = categoryOpportunityItems.filter((item) =>
    financialOpportunityKeys.includes(item.key || "")
  );
  const visibleModules = new Set(
    product?.modules?.visible?.map((module) => module.key) || []
  );
  const hasModule = (key: string) => !product || visibleModules.has(key);
  const maxAssets = product?.entitlements?.max_assets;
  const canAddPortfolioAsset =
    maxAssets === null ||
    maxAssets === undefined ||
    portfolio.length < Number(maxAssets);
  const navigation: NavigationItem[] = [
    {
      key: "home",
      label: "Home",
      description: "Vue globale",
    },
    {
      key: "finances",
      label: "Finances",
      description: "Cashflow",
    },
    {
      key: "investments",
      label: "Investments",
      description: "Allocation",
    },
    {
      key: "real_estate",
      label: "Immobilier",
      description: "Biens",
      locked: !hasModule("real_estate"),
    },
    {
      key: "ventures",
      label: "Business",
      description: "Ventures",
      locked: !hasModule("yield_assets") && !hasModule("venture_assets"),
    },
    {
      key: "ai",
      label: "AI",
      description: "Opportunites",
    },
    {
      key: "progression",
      label: "Progression",
      description: "XP & badges",
    },
    {
      key: "settings",
      label: "Family Office",
      description: "Equipe",
      locked: !hasModule("multi_user"),
    },
  ];
  const activeNavigation = navigation.find((item) => item.key === activeSection);

  const handleUpdateOnboarding = async () => {
    const revenusMensuels = prompt(
      "Revenus mensuels ?",
      String(onboarding?.revenus_mensuels ?? onboarding?.monthly_income ?? 0)
    );

    const chargesMensuelles = prompt(
      "Charges mensuelles ?",
      String(onboarding?.charges_mensuelles ?? onboarding?.monthly_expenses ?? 0)
    );

    if (revenusMensuels === null || chargesMensuelles === null) return;

    try {
      await apiRequest("/auth/onboarding/update", token, {
        method: "PUT",
        body: JSON.stringify({
          revenus_mensuels: Number(revenusMensuels),
          charges_mensuelles: Number(chargesMensuelles),
        }),
      });

      await refreshAfterMutation();
      alert("Situation mise a jour");
    } catch (err) {
      console.error(err);
      alert("Erreur onboarding");
    }
  };

  const handleUpgradePlan = async (plan: string) => {
    try {
      const data = await apiRequest<{ url?: string }>("/billing/create-checkout-session", token, {
        method: "POST",
        body: JSON.stringify({ plan }),
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout Stripe indisponible pour le moment.");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "";
      const missingPrice = message.match(/STRIPE_PRICE_[A-Z_]+/)?.[0];

      alert(
        missingPrice
          ? `Abonnement Stripe non configure: ajoute ${missingPrice} dans Render.`
          : "Impossible d'ouvrir l'abonnement. Verifie la configuration Stripe."
      );
    }
  };

  const handleCreateWorkspace = async () => {
    const name = prompt("Nom du nouvel espace ?", "Family Office");
    if (!name) return;

    try {
      const data = await apiRequest<{ workspace_id?: number }>("/workspaces/", token, {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      if (data.workspace_id && typeof window !== "undefined") {
        localStorage.setItem("activeWorkspaceId", String(data.workspace_id));
      }

      await refreshAll();
    } catch (err) {
      console.error(err);
      alert("Impossible de creer cet espace.");
    }
  };

  const handleInviteWorkspaceMember = async (workspaceId: number) => {
    const email = prompt("Email du membre a inviter ?");
    if (!email) return;

    const role = prompt("Role ? owner/admin/member/viewer", "member") || "member";

    try {
      const data = await apiRequest<{ invite_url?: string; token?: string }>(
        `/workspaces/${workspaceId}/invite`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ email, role }),
        }
      );

      await refreshAll();
      alert(
        data.invite_url
          ? `Invitation creee. Lien: ${data.invite_url}`
          : "Invitation creee."
      );
    } catch (err) {
      console.error(err);
      alert("Impossible de creer l'invitation.");
    }
  };

  const handleSwitchWorkspace = async (workspaceId: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeWorkspaceId", String(workspaceId));
    }

    await refreshAll();
  };

  const savePortfolioAsset = async (
    url: string,
    method: "POST" | "PUT",
    payload: PortfolioPayload
  ) => {
    await apiRequest(url, token, {
      method,
      body: JSON.stringify(payload),
    });

    await refreshAfterMutation();
  };

  const handleAddPortfolioAsset = async (assetTypePreset?: string) => {
    if (!canAddPortfolioAsset) {
      alert("Limite du plan atteinte. Passe en Gold pour ajouter plus d'assets.");
      return;
    }

    const assetName = prompt("Nom de l'actif ? (ex: AAPL, BTC, EUR/USD)");
    if (!assetName) return;

    const assetType = prompt(
      "Type d'actif ? (ex: STOCK, CRYPTO, ETF, COMMODITIES, FOREX)",
      assetTypePreset || ""
    );
    if (!assetType) return;

    if (isRealEstatePortfolioType(assetType)) {
      alert(
        "Cette categorie a maintenant son espace dedie. Utilise le module correspondant pour ajouter cet asset."
      );
      return;
    }

    const quantity = parsePositiveNumber(prompt("Quantite ?", "1"));
    const purchasePrice = parsePositiveNumber(prompt("Prix d'achat unitaire ?", "0"));

    if (quantity === null || purchasePrice === null) {
      alert("Quantite ou prix invalide");
      return;
    }

    try {
      await savePortfolioAsset("/portfolio", "POST", {
        asset_name: assetName,
        asset_type: assetType,
        quantity,
        purchase_price: purchasePrice,
      });
    } catch (err) {
      console.error(err);
      alert("Erreur ajout portfolio");
    }
  };

  const handleUpdatePortfolioAsset = async (asset: PortfolioAsset) => {
    const assetName = prompt(
      "Nom de l'actif ?",
      asset.asset_name || asset.name || ""
    );
    if (!assetName) return;

    const assetType = prompt(
      "Type d'actif ?",
      asset.asset_type || asset.type || ""
    );
    if (!assetType) return;

    if (isRealEstatePortfolioType(assetType)) {
      alert(
        "Cette categorie se gere dans un module dedie. Cree l'asset dans le bon module puis supprime l'ancien asset si besoin."
      );
      return;
    }

    const quantity = parsePositiveNumber(
      prompt("Quantite ?", String(asset.quantity ?? 1))
    );
    const purchasePrice = parsePositiveNumber(
      prompt("Prix d'achat unitaire ?", String(asset.purchase_price ?? 0))
    );

    if (quantity === null || purchasePrice === null) {
      alert("Quantite ou prix invalide");
      return;
    }

    try {
      await savePortfolioAsset(`/portfolio/${asset.id}`, "PUT", {
        asset_name: assetName,
        asset_type: assetType,
        quantity,
        purchase_price: purchasePrice,
      });
    } catch (err) {
      console.error(err);
      alert("Erreur modification portfolio");
    }
  };

  const handleDeletePortfolioAsset = async (id: number) => {
    if (!confirm("Supprimer cet actif du portfolio ?")) return;

    try {
      await apiRequest(`/portfolio/${id}`, token, {
        method: "DELETE",
      });

      await refreshAfterMutation();
    } catch (err) {
      console.error(err);
      alert("Erreur suppression portfolio");
    }
  };

  const handleAddFinance = async (data: FinancePayload) => {
    await apiRequest("/finance", token, {
      method: "POST",
      body: JSON.stringify(data),
    });

    await refreshAfterMutation();
  };

  const handleDeleteFinance = async (id: number) => {
    await apiRequest(`/finance/${id}`, token, {
      method: "DELETE",
    });

    await refreshAfterMutation();
  };

  const handleUpdateFinance = async (item: FinanceEntry) => {
    const name = prompt("Nom ?", item.name || item.label || "");
    const amount = prompt("Montant ?", String(item.amount || 0));

    if (!name || !amount) return;

    await apiRequest(`/finance/${item.id}`, token, {
      method: "PUT",
      body: JSON.stringify({
        name,
        amount: Number(amount),
      }),
    });

    await refreshAfterMutation();
  };

  const buildRealEstatePayload = (
    type: RealEstateType,
    asset?: RealEstateAsset
  ): RealEstatePayload | null => {
    const name = prompt("Nom du bien ?", asset?.name || "");
    if (!name) return null;

    const purchasePrice = parseNonNegativeNumber(
      prompt("Prix d'achat ?", String(asset?.purchase_price ?? 0))
    );
    if (purchasePrice === null) {
      alert("Prix d'achat invalide");
      return null;
    }

    const estimatedValue = parseNonNegativeNumber(
      prompt(
        type === "flip" ? "Valeur estimee actuelle ?" : "Valeur estimee ?",
        String(asset?.estimated_value ?? asset?.target_value ?? purchasePrice)
      )
    );
    if (estimatedValue === null) {
      alert("Valeur estimee invalide");
      return null;
    }

    let resalePrice = Number(asset?.resale_price || 0);
    let monthlyRent = Number(asset?.monthly_rent || 0);
    let monthlyCharges = Number(asset?.monthly_charges || 0);

    if (type === "flip") {
      const nextResalePrice = parseNonNegativeNumber(
        prompt("Prix de revente cible ?", String(resalePrice || estimatedValue))
      );
      if (nextResalePrice === null) {
        alert("Prix de revente invalide");
        return null;
      }
      resalePrice = nextResalePrice;
    }

    if (type === "rental") {
      const nextMonthlyRent = parseNonNegativeNumber(
        prompt("Loyer mensuel ?", String(monthlyRent))
      );
      const nextMonthlyCharges = parseNonNegativeNumber(
        prompt("Charges mensuelles liees au bien ?", String(monthlyCharges))
      );

      if (nextMonthlyRent === null || nextMonthlyCharges === null) {
        alert("Loyer ou charges invalides");
        return null;
      }

      monthlyRent = nextMonthlyRent;
      monthlyCharges = nextMonthlyCharges;
    }

    const notes = prompt("Notes ? (optionnel)", asset?.notes || "") || null;

    return {
      property_type: type,
      name,
      purchase_price: purchasePrice,
      estimated_value: estimatedValue,
      resale_price: resalePrice,
      monthly_rent: monthlyRent,
      monthly_charges: monthlyCharges,
      notes,
    };
  };

  const handleAddRealEstate = async (type: RealEstateType) => {
    const payload = buildRealEstatePayload(type);
    if (!payload) return;

    try {
      await apiRequest("/real-estate/", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await refreshAfterMutation();
    } catch (err) {
      console.error(err);
      alert("Erreur ajout immobilier");
    }
  };

  const handleUpdateRealEstate = async (asset: RealEstateAsset) => {
    const payload = buildRealEstatePayload(asset.property_type, asset);
    if (!payload) return;

    try {
      await apiRequest(`/real-estate/${asset.id}`, token, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await refreshAfterMutation();
    } catch (err) {
      console.error(err);
      alert("Erreur modification immobilier");
    }
  };

  const handleDeleteRealEstate = async (id: number) => {
    if (!confirm("Supprimer ce bien immobilier ?")) return;

    try {
      await apiRequest(`/real-estate/${id}`, token, {
        method: "DELETE",
      });

      await refreshAfterMutation();
    } catch (err) {
      console.error(err);
      alert("Erreur suppression immobilier");
    }
  };

  const buildYieldPayload = (
    type: YieldAssetType,
    asset?: YieldAsset
  ): YieldAssetPayload | null => {
    const name = prompt("Nom ?", asset?.name || "");
    if (!name) return null;

    const principal = parseNonNegativeNumber(
      prompt("Montant prete / investi ?", String(asset?.principal ?? 0))
    );
    const averageRate = parseNonNegativeNumber(
      prompt("Taux moyen annuel (%) ?", String(asset?.average_rate ?? 0))
    );
    const durationMonths = parsePositiveNumber(
      prompt("Duree en mois ?", String(asset?.duration_months ?? 12))
    );

    if (principal === null || averageRate === null || durationMonths === null) {
      alert("Montant, taux ou duree invalide");
      return null;
    }

    return {
      asset_type: type,
      name,
      principal,
      average_rate: averageRate,
      duration_months: Math.round(durationMonths),
      notes: prompt("Notes ? (optionnel)", asset?.notes || "") || null,
    };
  };

  const handleAddYieldAsset = async (type: YieldAssetType) => {
    const payload = buildYieldPayload(type);
    if (!payload) return;

    await apiRequest("/yield-assets/", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await refreshAfterMutation();
  };

  const handleUpdateYieldAsset = async (asset: YieldAsset) => {
    const payload = buildYieldPayload(asset.asset_type, asset);
    if (!payload) return;

    await apiRequest(`/yield-assets/${asset.id}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await refreshAfterMutation();
  };

  const handleDeleteYieldAsset = async (id: number) => {
    if (!confirm("Supprimer cet investissement ?")) return;

    await apiRequest(`/yield-assets/${id}`, token, { method: "DELETE" });
    await refreshAfterMutation();
  };

  const buildVenturePayload = (
    type: VentureAssetType,
    asset?: VentureAsset
  ): VentureAssetPayload | null => {
    const name = prompt("Nom ?", asset?.name || "");
    if (!name) return null;

    const revenue = parseNonNegativeNumber(
      prompt("Chiffre d'affaires ?", String(asset?.revenue ?? 0))
    );
    const charges = parseNonNegativeNumber(
      prompt("Charges ?", String(asset?.charges ?? 0))
    );
    const fundraising = parseNonNegativeNumber(
      prompt("Levee de fonds ?", String(asset?.fundraising ?? 0))
    );
    const debts = parseNonNegativeNumber(
      prompt("Dettes ?", String(asset?.debts ?? 0))
    );
    const valuation = parseNonNegativeNumber(
      prompt("Valorisation ? (0 si a calculer)", String(asset?.valuation ?? 0))
    );

    if (
      revenue === null ||
      charges === null ||
      fundraising === null ||
      debts === null ||
      valuation === null
    ) {
      alert("Donnee invalide");
      return null;
    }

    return {
      asset_type: type,
      name,
      revenue,
      charges,
      fundraising,
      debts,
      valuation,
      notes: prompt("Notes ? (optionnel)", asset?.notes || "") || null,
    };
  };

  const handleAddVentureAsset = async (type: VentureAssetType) => {
    const payload = buildVenturePayload(type);
    if (!payload) return;

    await apiRequest("/venture-assets/", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await refreshAfterMutation();
  };

  const handleUpdateVentureAsset = async (asset: VentureAsset) => {
    const payload = buildVenturePayload(asset.asset_type, asset);
    if (!payload) return;

    await apiRequest(`/venture-assets/${asset.id}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await refreshAfterMutation();
  };

  const handleDeleteVentureAsset = async (id: number) => {
    if (!confirm("Supprimer ce business ?")) return;

    await apiRequest(`/venture-assets/${id}`, token, { method: "DELETE" });
    await refreshAfterMutation();
  };

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Header dashboard={dashboard} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 p-4 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-3">
            <div className="mb-3 px-2">
              <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                Navigation
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Summary first. Drill-down second.
              </p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {navigation.map((item) => {
                const active = item.key === activeSection;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`min-w-[150px] rounded-xl border px-3 py-3 text-left transition lg:min-w-0 ${
                      active
                        ? "border-[#3fa9f5]/60 bg-[#3fa9f5]/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{item.label}</span>
                      {item.locked && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-400">
                          lock
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Wealth OS / {activeNavigation?.label || "Home"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Modules puissants, affiches seulement quand ils aident la decision.
            </p>
          </div>

          {activeSection === "home" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Home Dashboard"
                title="Vue globale"
                description="La synthese immediate de ta situation: patrimoine, score, progression et prochaines actions prioritaires."
              />

              <section className="rounded-2xl border border-[#3fa9f5]/20 bg-gradient-to-br from-[#08131f] via-black to-[#0b2035] p-6">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.4fr]">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[#3fa9f5]">
                      Family Office OS
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="rounded-full bg-[#3fa9f5]/20 px-4 py-2 text-[#3fa9f5]">
                        {product?.progression?.level || commandCenter?.level || "Starter"}
                      </span>
                      <span className="text-5xl font-black">{globalScore}/100</span>
                    </div>
                    <p className="mt-4 text-gray-400">
                      Plan {product?.plan || dashboard?.plan || "FREE"} ·{" "}
                      {product?.progression?.status || "Foundation"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-gray-400">Patrimoine global</p>
                      <h3 className="mt-2 text-2xl font-black">
                        {money.format(globalPortfolioValue)} EUR
                      </h3>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-gray-400">+/- value</p>
                      <h3 className={`mt-2 text-2xl font-black ${globalPortfolioGainClass}`}>
                        {globalPortfolioGain >= 0 ? "+" : ""}
                        {money.format(globalPortfolioGain)} EUR
                      </h3>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-gray-400">Completion</p>
                      <h3 className="mt-2 text-2xl font-black text-[#3fa9f5]">
                        {product?.data_profile?.completion_percent || 0}%
                      </h3>
                    </div>
                  </div>
                </div>

                {categoryCounts.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {categoryCounts.slice(0, 6).map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        <span className="text-gray-400">{item.label}</span>{" "}
                        <span className="font-bold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <h2 className="mb-4 text-2xl font-bold">Evolution</h2>
                  <ChartModule
                    history={history}
                    initialInvestment={initialInvestment}
                    currentValue={globalPortfolioValue}
                    currentInvestment={globalPortfolioInvested}
                  />
                </section>

                <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <h2 className="text-2xl font-bold">Prochaines actions</h2>
                  <div className="mt-4 space-y-3">
                    {(product?.missions || []).slice(0, 3).map((mission) => (
                      <div
                        key={mission.key}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-white">{mission.title}</p>
                            <p className="mt-1 text-sm text-gray-400">
                              {mission.description}
                            </p>
                          </div>
                          {mission.xp ? (
                            <span className="text-xs font-bold text-emerald-300">
                              +{mission.xp} XP
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    {(product?.missions || []).length === 0 && (
                      <p className="text-sm text-gray-400">
                        Aucune action urgente. Continue a enrichir ton patrimoine.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <ProductProgressPanel product={product} onUpgrade={handleUpgradePlan} />
            </div>
          )}

          {activeSection === "finances" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Finances"
                title="Base financiere"
                description="Revenus, charges, epargne, dettes et cashflow. Cette section sert a clarifier les fondations avant l'allocation."
              />

              <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <div className="mb-4 flex justify-between gap-4">
                  <h2 className="text-2xl font-bold">Situation</h2>
                  <button
                    onClick={handleUpdateOnboarding}
                    className="rounded-xl bg-[#3fa9f5] px-4 py-2"
                  >
                    Modifier
                  </button>
                </div>
                <FinanceModule
                  revenusMensuels={
                    onboarding?.revenus_mensuels ?? onboarding?.monthly_income ?? 0
                  }
                  chargesMensuelles={
                    onboarding?.charges_mensuelles ?? onboarding?.monthly_expenses ?? 0
                  }
                />
              </section>

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <FinanceBlock title="Revenus" type="revenus" data={finance.revenus} onCreate={handleAddFinance} onDelete={handleDeleteFinance} onUpdate={handleUpdateFinance} />
                <FinanceBlock title="Charges" type="charges" data={finance.charges} onCreate={handleAddFinance} onDelete={handleDeleteFinance} onUpdate={handleUpdateFinance} />
                <FinanceBlock title="Epargne" type="epargne" data={finance.epargne} onCreate={handleAddFinance} onDelete={handleDeleteFinance} onUpdate={handleUpdateFinance} />
                <FinanceBlock title="Dettes" type="dettes" data={finance.dettes} onCreate={handleAddFinance} onDelete={handleDeleteFinance} onUpdate={handleUpdateFinance} />
              </section>
            </div>
          )}

          {activeSection === "investments" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Investments"
                title="Allocation & multi-assets"
                description="Stocks, ETF, crypto, forex, commodities, diversification et exposition. Pas de trading complexe: uniquement pilotage patrimonial."
              />

              {hasModule("diversification") ? (
                <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <ExposureBreakdown portfolio={portfolio} realEstate={realEstate} yieldAssets={yieldAssets} ventureAssets={ventureAssets} />
                  <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                    <h2 className="mb-4 text-2xl font-bold">Chart Portfolio</h2>
                    <ChartModule
                      history={history}
                      initialInvestment={initialInvestment}
                      currentValue={globalPortfolioValue}
                      currentInvestment={globalPortfolioInvested}
                    />
                  </section>
                </section>
              ) : (
                <LockedSection
                  title="Analytics d'allocation"
                  description="L'exposition avancee et les graphiques d'allocation se debloquent progressivement avec la phase Growth."
                  onUpgrade={handleUpgradePlan}
                  plan="gold"
                />
              )}

              <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <h2 className="mb-4 text-2xl font-bold">Portfolio</h2>
                <PortfolioModule
                  portfolio={portfolio}
                  onAdd={handleAddPortfolioAsset}
                  onUpdate={handleUpdatePortfolioAsset}
                  onDelete={handleDeletePortfolioAsset}
                  opportunities={financialOpportunities}
                />
              </section>
            </div>
          )}

          {activeSection === "real_estate" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Immobilier"
                title="Biens & rendement"
                description="Residence principale, locatif, achat/revente, valorisation et plus-value potentielle."
              />
              {hasModule("real_estate") ? (
                <RealEstateModule
                  data={realEstate}
                  onAdd={handleAddRealEstate}
                  onUpdate={handleUpdateRealEstate}
                  onDelete={handleDeleteRealEstate}
                  opportunity={findOpportunity("real_estate")}
                />
              ) : (
                <LockedSection
                  title="Module immobilier"
                  description="Debloque le suivi immobilier pour separer residences, locatif, achat/revente et rendement de ton portefeuille financier."
                  onUpgrade={handleUpgradePlan}
                  plan="gold"
                />
              )}
            </div>
          )}

          {activeSection === "ventures" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Business & Ventures"
                title="Entreprises, startups et rendement prive"
                description="Business, startup, AI business, franchise, crowdfunding et private equity dans une vue dediee."
              />

              {hasModule("yield_assets") ? (
                <YieldInvestmentsModule
                  data={yieldAssets}
                  onAdd={handleAddYieldAsset}
                  onUpdate={handleUpdateYieldAsset}
                  onDelete={handleDeleteYieldAsset}
                  opportunities={categoryOpportunityItems.filter((item) =>
                    ["crowdfunding", "private_equity"].includes(item.key || "")
                  )}
                />
              ) : (
                <LockedSection
                  title="Prets & Private Equity"
                  description="Suis les montants pretes, taux moyens et valeurs finales dans un espace dedie."
                  onUpgrade={handleUpgradePlan}
                  plan="gold"
                />
              )}

              {hasModule("venture_assets") ? (
                <VentureAssetsModule
                  data={ventureAssets}
                  onAdd={handleAddVentureAsset}
                  onUpdate={handleUpdateVentureAsset}
                  onDelete={handleDeleteVentureAsset}
                  opportunities={categoryOpportunityItems.filter((item) =>
                    ["ai_business", "business", "startup", "franchise"].includes(
                      item.key || ""
                    )
                  )}
                />
              ) : null}
            </div>
          )}

          {activeSection === "ai" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="AI & Opportunities"
                title="Coach, signaux et recommandations"
                description="Un espace pour poser tes questions, lire les alertes importantes et transformer les opportunites en actions."
              />

              {hasModule("opportunities") ? (
                <OpportunitiesModule intelligence={intelligence} />
              ) : (
                <LockedSection
                  title="Opportunites avancees"
                  description="Les signaux personnalises par categorie se debloquent avec le plan Growth."
                  onUpgrade={handleUpgradePlan}
                  plan="gold"
                />
              )}

              <AdvisorChat
                recommendations={scoreAdvice}
                aiCoach={gamification?.ai_coach}
                notification={gamification?.notification}
              />
            </div>
          )}

          {activeSection === "progression" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Progression"
                title="XP, niveaux et deblocages"
                description="Une gamification premium pour sentir la montee en puissance sans transformer l'app en jeu."
              />

              <GamificationPanel
                gamification={gamification || undefined}
                score={globalScore}
                userLevel={product?.progression?.level || commandCenter?.level || dashboard?.level}
                plan={product?.plan || dashboard?.plan}
                onUpgrade={handleUpgradePlan}
              />

              <ProductProgressPanel product={product} onUpgrade={handleUpgradePlan} />
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Settings / Family Office"
                title="Equipe, gouvernance et abonnement"
                description="L'espace de controle pour le multi-user, les roles, l'abonnement et les preferences Family Office."
              />

              {hasModule("multi_user") ? (
                <WorkspacePanel
                  data={workspaces}
                  onCreate={handleCreateWorkspace}
                  onInvite={handleInviteWorkspaceMember}
                  onSwitch={handleSwitchWorkspace}
                />
              ) : (
                <LockedSection
                  title="Multi-user Family Office"
                  description="Invite ton equipe, ta famille ou tes partenaires lorsque ton espace passe en Wealth OS."
                  onUpgrade={handleUpgradePlan}
                  plan="elite"
                />
              )}

              <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <h2 className="text-2xl font-bold">Abonnement</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Plan actuel: {product?.plan || dashboard?.plan || "FREE"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleUpgradePlan("gold")}
                    className="rounded-xl border border-[#3fa9f5]/40 bg-[#3fa9f5]/10 px-4 py-2 text-sm font-semibold text-[#3fa9f5]"
                  >
                    Gold - Growth
                  </button>
                  <button
                    onClick={() => handleUpgradePlan("elite")}
                    className="rounded-xl bg-[#3fa9f5] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Elite - Wealth OS
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
