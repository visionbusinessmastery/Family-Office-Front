"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useDashboard } from "@/hooks/useDashboard";
import BrandMark from "@/components/BrandMark";
import {
  ActionButton,
  SelectField,
  TextField,
  WealthModal,
  WealthToast,
} from "@/components/ui/WealthUI";
import type {
  CategoryOpportunityData,
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
  UserIntelligence,
  YieldAsset,
  YieldAssetPayload,
  YieldAssetType,
} from "@/lib/types";

import Header from "@/components/dashboard/Header";
import AdvisorChat from "@/components/dashboard/AdvisorChat";
import DailyWealthCheck from "@/components/dashboard/DailyWealthCheck";
import ExposureBreakdown from "@/components/dashboard/ExposureBreakdown";
import FinanceModule from "@/components/dashboard/FinanceModule";
import LegacyOfficePanel from "@/components/dashboard/LegacyOfficePanel";
import OpportunityDiscoveryPanel from "@/components/dashboard/OpportunityDiscoveryPanel";
import OpportunitiesModule from "@/components/dashboard/OpportunitiesModule";
import PortfolioModule from "@/components/dashboard/PortfolioModule";
import ProductProgressPanel from "@/components/dashboard/ProductProgressPanel";
import ProfileReferralPanel from "@/components/dashboard/ProfileReferralPanel";
import RealEstateModule from "@/components/dashboard/RealEstateModule";
import ThemeSwitcher from "@/components/dashboard/ThemeSwitcher";
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
  | "legacy"
  | "settings";

type NavigationItem = {
  key: DashboardSection;
  label: string;
  description: string;
  locked?: boolean;
};

type DashboardFormKind =
  | "onboarding"
  | "workspace"
  | "invite"
  | "portfolio"
  | "finance"
  | "real_estate"
  | "yield"
  | "venture";

type DashboardFormState = {
  kind: DashboardFormKind;
  title: string;
  description?: string;
  values: Record<string, string>;
  context?: {
    id?: number;
    workspaceId?: number;
    propertyType?: RealEstateType;
    yieldType?: YieldAssetType;
    ventureType?: VentureAssetType;
    financeItem?: FinanceEntry;
  };
};

type ConfirmState = {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
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

const getStrategicOpportunityCount = (
  opportunities: UserIntelligence["opportunities"] | undefined,
  categories: CategoryOpportunityData | null
) => {
  if (Array.isArray(opportunities)) return opportunities.length;

  if (typeof opportunities?.count === "number") {
    return opportunities.count;
  }

  if (Array.isArray(opportunities?.opportunities)) {
    return opportunities.opportunities.length;
  }

  return categories?.categories?.filter(
    (item) => item.detected_opportunity || item.market_signal?.headline
  ).length || 0;
};

export default function Dashboard() {
  const {
    dashboard,
    portfolio,
    realEstate,
    yieldAssets,
    ventureAssets,
    intelligence,
    categoryOpportunities,
    legacyOverview,
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
  const [formModal, setFormModal] = useState<DashboardFormState | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const updateModalValue = (key: string, value: string) => {
    setFormModal((current) =>
      current
        ? { ...current, values: { ...current.values, [key]: value } }
        : current
    );
  };

  const closeFormModal = () => {
    if (!modalLoading) setFormModal(null);
  };

  const goToSection = (section: DashboardSection) => {
    setActiveSection(section);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  const interactiveCard =
    "cursor-pointer transition hover:-translate-y-0.5 hover:border-[#3fa9f5]/40 hover:bg-white/[0.07]";

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black p-4 text-white">
        <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-[#061827]" />
        <div className="relative mx-auto max-w-7xl space-y-5 opacity-35 blur-[1px]">
          <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
            <div className="hidden h-96 rounded-2xl border border-white/10 bg-white/[0.04] lg:block" />
            <div className="space-y-5">
              <div className="h-56 rounded-2xl border border-white/10 bg-white/[0.04]" />
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="h-72 rounded-2xl border border-white/10 bg-white/[0.04]" />
                <div className="h-72 rounded-2xl border border-white/10 bg-white/[0.04]" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <div className="fade-in flex flex-col items-center text-center">
            <BrandMark />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-300">
              Le cockpit se materialise progressivement. Synchronisation du plan,
              des modules et de la progression.
            </p>
            <div className="mt-8 h-16 w-16 rounded-full border-2 border-[#3fa9f5]/30 border-r-amber-300 border-t-[#3fa9f5] animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  const globalScore =
    Number(intelligence?.global_score ?? commandCenter?.global_score ?? 0) || 0;
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
    { label: "Business digital", value: (ventureAssets?.assets || []).filter((asset) => asset.asset_type === "ai_business").length },
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
  const currentPlan = product?.plan || dashboard?.plan;
  const hasModule = (key: string) =>
    visibleModules.has(key);
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
      key: "ai",
      label: "Conseiller",
      description: "Conseiller",
    },
    {
      key: "progression",
      label: "Progression",
      description: "Statut",
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
    },
    {
      key: "ventures",
      label: "Business",
      description: "Ventures",
    },
    {
      key: "legacy",
      label: "Legacy",
      description: "Transmission",
    },
    {
      key: "settings",
      label: "Family Office",
      description: "Identité",
    },
  ];
  const activeNavigation = navigation.find((item) => item.key === activeSection);
  const opportunitiesCount = getStrategicOpportunityCount(
    intelligence?.opportunities,
    categoryOpportunities
  );

  const handleUpdateOnboarding = async () => {
    setFormModal({
      kind: "onboarding",
      title: "Modifier la situation",
      description: "Mets a jour revenus et charges avec une saisie claire.",
      values: {
        revenus_mensuels: String(
          onboarding?.revenus_mensuels ?? onboarding?.monthly_income ?? 0
        ),
        charges_mensuelles: String(
          onboarding?.charges_mensuelles ?? onboarding?.monthly_expenses ?? 0
        ),
      },
    });
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
        showToast("Checkout Stripe indisponible pour le moment.", "error");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "";
      const missingPrice = message.match(/STRIPE_PRICE_[A-Z_]+/)?.[0];

      showToast(
        missingPrice
          ? `Abonnement Stripe non configure: ajoute ${missingPrice} dans Render.`
          : "Impossible d'ouvrir l'abonnement. Verifie la configuration Stripe.",
        "error"
      );
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      const data = await apiRequest<{ url?: string }>("/billing/customer-portal", token, {
        method: "POST",
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast("Portail abonnement indisponible pour le moment.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Impossible d'ouvrir le portail abonnement pour le moment.", "error");
    }
  };

  const handleCreateWorkspace = async () => {
    setFormModal({
      kind: "workspace",
      title: "Nouvel espace",
      description: "Cree un espace Family Office clair et partageable.",
      values: { name: "Family Office" },
    });
  };

  const handleInviteWorkspaceMember = async (workspaceId: number) => {
    setFormModal({
      kind: "invite",
      title: "Inviter un membre",
      description: "Ajoute une personne avec le role adapte a ton espace.",
      values: { email: "", role: "member" },
      context: { workspaceId },
    });
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
      showToast("Limite du plan atteinte. Passe en Gold pour ajouter plus d'assets.", "error");
      return;
    }

    setFormModal({
      kind: "portfolio",
      title: "Ajouter un actif",
      description: "Actions, ETF, crypto, commodities ou devises. Les autres categories ont leur espace dedie.",
      values: {
        asset_name: "",
        asset_type: assetTypePreset || "",
        quantity: "1",
        purchase_price: "0",
      },
    });
  };

  const handleUpdatePortfolioAsset = async (asset: PortfolioAsset) => {
    setFormModal({
      kind: "portfolio",
      title: "Modifier l'actif",
      description: "Garde cette ligne dans les categories financieres dediees au portefeuille.",
      values: {
        asset_name: asset.asset_name || asset.name || "",
        asset_type: asset.asset_type || asset.type || "",
        quantity: String(asset.quantity ?? 1),
        purchase_price: String(asset.purchase_price ?? 0),
      },
      context: { id: asset.id },
    });
  };

  const handleDeletePortfolioAsset = async (id: number) => {
    setConfirmModal({
      title: "Supprimer cet actif ?",
      description: "Cette action retire la ligne du portefeuille.",
      onConfirm: async () => {
        await apiRequest(`/portfolio/${id}`, token, { method: "DELETE" });
        await refreshAfterMutation();
        showToast("Actif supprime.", "success");
      },
    });
  };

  const handleAddFinance = async (data: FinancePayload) => {
    await apiRequest("/finance/", token, {
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
    await apiRequest(`/finance/${item.id}`, token, {
      method: "PUT",
      body: JSON.stringify({
        name: item.name || item.label || "",
        amount: Number(item.amount || 0),
      }),
    });

    await refreshAfterMutation();
  };

  const handleAddRealEstate = async (type: RealEstateType) => {
    setFormModal({
      kind: "real_estate",
      title: "Ajouter un bien",
      description: "Suis achat, valeur cible, plus-value et rendement dans un format unifie.",
      values: {
        name: "",
        purchase_price: "0",
        estimated_value: "0",
        resale_price: "0",
        monthly_rent: "0",
        monthly_charges: "0",
        notes: "",
      },
      context: { propertyType: type },
    });
  };

  const handleUpdateRealEstate = async (asset: RealEstateAsset) => {
    setFormModal({
      kind: "real_estate",
      title: "Modifier le bien",
      description: "Mets a jour les chiffres sans changer la logique de calcul.",
      values: {
        name: asset.name || "",
        purchase_price: String(asset.purchase_price ?? 0),
        estimated_value: String(asset.estimated_value ?? asset.target_value ?? 0),
        resale_price: String(asset.resale_price ?? 0),
        monthly_rent: String(asset.monthly_rent ?? 0),
        monthly_charges: String(asset.monthly_charges ?? 0),
        notes: asset.notes || "",
      },
      context: { id: asset.id, propertyType: asset.property_type },
    });
  };

  const handleDeleteRealEstate = async (id: number) => {
    setConfirmModal({
      title: "Supprimer ce bien ?",
      description: "Cette action retire ce bien de la rubrique immobilier.",
      onConfirm: async () => {
        await apiRequest(`/real-estate/${id}`, token, { method: "DELETE" });
        await refreshAfterMutation();
        showToast("Bien supprime.", "success");
      },
    });
  };

  const handleAddYieldAsset = async (type: YieldAssetType) => {
    setFormModal({
      kind: "yield",
      title: "Ajouter un investissement",
      description: "Renseigne capital, taux moyen et duree dans un format homogene.",
      values: {
        name: "",
        principal: "0",
        average_rate: "0",
        duration_months: "12",
        notes: "",
      },
      context: { yieldType: type },
    });
  };

  const handleUpdateYieldAsset = async (asset: YieldAsset) => {
    setFormModal({
      kind: "yield",
      title: "Modifier l'investissement",
      description: "Mets a jour capital, taux moyen et duree.",
      values: {
        name: asset.name || "",
        principal: String(asset.principal ?? 0),
        average_rate: String(asset.average_rate ?? 0),
        duration_months: String(asset.duration_months ?? 12),
        notes: asset.notes || "",
      },
      context: { id: asset.id, yieldType: asset.asset_type },
    });
  };

  const handleDeleteYieldAsset = async (id: number) => {
    setConfirmModal({
      title: "Supprimer cet investissement ?",
      description: "Cette action retire cet actif de la rubrique rendement prive.",
      onConfirm: async () => {
        await apiRequest(`/yield-assets/${id}`, token, { method: "DELETE" });
        await refreshAfterMutation();
        showToast("Investissement supprime.", "success");
      },
    });
  };

  const handleAddVentureAsset = async (type: VentureAssetType) => {
    setFormModal({
      kind: "venture",
      title: "Ajouter un business",
      description: "Suis chiffre d'affaires, charges, levees, dettes et valorisation.",
      values: {
        name: "",
        revenue: "0",
        charges: "0",
        fundraising: "0",
        debts: "0",
        valuation: "0",
        notes: "",
      },
      context: { ventureType: type },
    });
  };

  const handleUpdateVentureAsset = async (asset: VentureAsset) => {
    setFormModal({
      kind: "venture",
      title: "Modifier le business",
      description: "Mets a jour les donnees d'exploitation sans changer le calcul.",
      values: {
        name: asset.name || "",
        revenue: String(asset.revenue ?? 0),
        charges: String(asset.charges ?? 0),
        fundraising: String(asset.fundraising ?? 0),
        debts: String(asset.debts ?? 0),
        valuation: String(asset.valuation ?? 0),
        notes: asset.notes || "",
      },
      context: { id: asset.id, ventureType: asset.asset_type },
    });
  };

  const handleDeleteVentureAsset = async (id: number) => {
    setConfirmModal({
      title: "Supprimer ce business ?",
      description: "Cette action retire cette ligne de la rubrique Business & Ventures.",
      onConfirm: async () => {
        await apiRequest(`/venture-assets/${id}`, token, { method: "DELETE" });
        await refreshAfterMutation();
        showToast("Business supprime.", "success");
      },
    });
  };

  const requireName = (value?: string) => {
    const trimmed = String(value || "").trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const handleSubmitModal = async () => {
    if (!formModal) return;

    const values = formModal.values;

    try {
      setModalLoading(true);

      if (formModal.kind === "onboarding") {
        await apiRequest("/auth/onboarding/update", token, {
          method: "PUT",
          body: JSON.stringify({
            revenus_mensuels: Number(values.revenus_mensuels || 0),
            charges_mensuelles: Number(values.charges_mensuelles || 0),
          }),
        });
        await refreshAfterMutation();
        showToast("Situation mise a jour.", "success");
      }

      if (formModal.kind === "workspace") {
        const name = requireName(values.name);
        if (!name) throw new Error("Nom requis");

        const data = await apiRequest<{ workspace_id?: number }>("/workspaces/", token, {
          method: "POST",
          body: JSON.stringify({ name }),
        });

        if (data.workspace_id && typeof window !== "undefined") {
          localStorage.setItem("activeWorkspaceId", String(data.workspace_id));
        }

        await refreshAll();
        showToast("Espace cree.", "success");
      }

      if (formModal.kind === "invite") {
        const email = requireName(values.email);
        const role = values.role || "member";
        const workspaceId = formModal.context?.workspaceId;
        if (!email || !workspaceId) throw new Error("Invitation incomplete");

        const data = await apiRequest<{ invite_url?: string; token?: string }>(
          `/workspaces/${workspaceId}/invite`,
          token,
          {
            method: "POST",
            body: JSON.stringify({ email, role }),
          }
        );

        await refreshAll();
        showToast(
          data.invite_url
            ? `Invitation creee. Lien: ${data.invite_url}`
            : "Invitation creee.",
          "success"
        );
      }

      if (formModal.kind === "portfolio") {
        const assetName = requireName(values.asset_name);
        const assetType = requireName(values.asset_type);
        const quantity = parsePositiveNumber(values.quantity);
        const purchasePrice = parsePositiveNumber(values.purchase_price);

        if (!assetName || !assetType || quantity === null || purchasePrice === null) {
          throw new Error("Donnees portfolio invalides");
        }

        if (isRealEstatePortfolioType(assetType)) {
          throw new Error("Cette categorie se gere dans son module dedie.");
        }

        await savePortfolioAsset(
          formModal.context?.id ? `/portfolio/${formModal.context.id}` : "/portfolio/",
          formModal.context?.id ? "PUT" : "POST",
          {
            asset_name: assetName,
            asset_type: assetType,
            quantity,
            purchase_price: purchasePrice,
          }
        );
        showToast("Portefeuille mis a jour.", "success");
      }

      if (formModal.kind === "real_estate") {
        const propertyType = formModal.context?.propertyType;
        const name = requireName(values.name);
        const purchasePrice = parseNonNegativeNumber(values.purchase_price);
        const estimatedValue = parseNonNegativeNumber(values.estimated_value);
        const resalePrice = parseNonNegativeNumber(values.resale_price);
        const monthlyRent = parseNonNegativeNumber(values.monthly_rent);
        const monthlyCharges = parseNonNegativeNumber(values.monthly_charges);

        if (
          !propertyType ||
          !name ||
          purchasePrice === null ||
          estimatedValue === null ||
          resalePrice === null ||
          monthlyRent === null ||
          monthlyCharges === null
        ) {
          throw new Error("Donnees immobilieres invalides");
        }

        const payload: RealEstatePayload = {
          property_type: propertyType,
          name,
          purchase_price: purchasePrice,
          estimated_value: estimatedValue,
          resale_price: resalePrice,
          monthly_rent: monthlyRent,
          monthly_charges: monthlyCharges,
          notes: values.notes || null,
        };

        await apiRequest(
          formModal.context?.id
            ? `/real-estate/${formModal.context.id}`
            : "/real-estate/",
          token,
          {
            method: formModal.context?.id ? "PUT" : "POST",
            body: JSON.stringify(payload),
          }
        );
        await refreshAfterMutation();
        showToast("Immobilier mis a jour.", "success");
      }

      if (formModal.kind === "yield") {
        const assetType = formModal.context?.yieldType;
        const name = requireName(values.name);
        const principal = parseNonNegativeNumber(values.principal);
        const averageRate = parseNonNegativeNumber(values.average_rate);
        const durationMonths = parsePositiveNumber(values.duration_months);

        if (!assetType || !name || principal === null || averageRate === null || durationMonths === null) {
          throw new Error("Donnees invalides");
        }

        const payload: YieldAssetPayload = {
          asset_type: assetType,
          name,
          principal,
          average_rate: averageRate,
          duration_months: Math.round(durationMonths),
          notes: values.notes || null,
        };

        await apiRequest(
          formModal.context?.id
            ? `/yield-assets/${formModal.context.id}`
            : "/yield-assets/",
          token,
          {
            method: formModal.context?.id ? "PUT" : "POST",
            body: JSON.stringify(payload),
          }
        );
        await refreshAfterMutation();
        showToast("Investissement mis a jour.", "success");
      }

      if (formModal.kind === "venture") {
        const assetType = formModal.context?.ventureType;
        const name = requireName(values.name);
        const revenue = parseNonNegativeNumber(values.revenue);
        const charges = parseNonNegativeNumber(values.charges);
        const fundraising = parseNonNegativeNumber(values.fundraising);
        const debts = parseNonNegativeNumber(values.debts);
        const valuation = parseNonNegativeNumber(values.valuation);

        if (
          !assetType ||
          !name ||
          revenue === null ||
          charges === null ||
          fundraising === null ||
          debts === null ||
          valuation === null
        ) {
          throw new Error("Donnees business invalides");
        }

        const payload: VentureAssetPayload = {
          asset_type: assetType,
          name,
          revenue,
          charges,
          fundraising,
          debts,
          valuation,
          notes: values.notes || null,
        };

        await apiRequest(
          formModal.context?.id
            ? `/venture-assets/${formModal.context.id}`
            : "/venture-assets/",
          token,
          {
            method: formModal.context?.id ? "PUT" : "POST",
            body: JSON.stringify(payload),
          }
        );
        await refreshAfterMutation();
        showToast("Business mis a jour.", "success");
      }

      setFormModal(null);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error ? err.message : "Impossible d'enregistrer.",
        "error"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmModal = async () => {
    if (!confirmModal) return;

    try {
      setModalLoading(true);
      await confirmModal.onConfirm();
      setConfirmModal(null);
    } catch (err) {
      console.error(err);
      showToast("Impossible de supprimer cet element.", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const renderFormFields = () => {
    if (!formModal) return null;
    const values = formModal.values;

    if (formModal.kind === "invite") {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Email" value={values.email || ""} onChange={(value) => updateModalValue("email", value)} />
          <SelectField
            label="Role"
            value={values.role || "member"}
            onChange={(value) => updateModalValue("role", value)}
            options={[
              { label: "Owner", value: "owner" },
              { label: "Admin", value: "admin" },
              { label: "Member", value: "member" },
              { label: "Viewer", value: "viewer" },
            ]}
          />
        </div>
      );
    }

    if (formModal.kind === "onboarding") {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Revenus mensuels" type="number" value={values.revenus_mensuels || "0"} onChange={(value) => updateModalValue("revenus_mensuels", value)} />
          <TextField label="Charges mensuelles" type="number" value={values.charges_mensuelles || "0"} onChange={(value) => updateModalValue("charges_mensuelles", value)} />
        </div>
      );
    }

    if (formModal.kind === "workspace") {
      return (
        <TextField label="Nom de l'espace" value={values.name || ""} onChange={(value) => updateModalValue("name", value)} />
      );
    }

    if (formModal.kind === "portfolio") {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Nom de l'actif" value={values.asset_name || ""} onChange={(value) => updateModalValue("asset_name", value)} placeholder="AAPL, BTC, EUR/USD" />
          <SelectField
            label="Classe d'actif"
            value={values.asset_type || ""}
            onChange={(value) => updateModalValue("asset_type", value)}
            options={[
              { label: "Action", value: "STOCK" },
              { label: "ETF", value: "ETF" },
              { label: "Crypto", value: "CRYPTO" },
              { label: "Forex", value: "FOREX" },
              { label: "Commodities", value: "COMMODITIES" },
            ]}
          />
          <TextField label="Quantité" type="number" value={values.quantity || "1"} onChange={(value) => updateModalValue("quantity", value)} />
          <TextField label="Prix d'achat unitaire" type="number" value={values.purchase_price || "0"} onChange={(value) => updateModalValue("purchase_price", value)} />
        </div>
      );
    }

    if (formModal.kind === "real_estate") {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Nom du bien" value={values.name || ""} onChange={(value) => updateModalValue("name", value)} />
          <TextField label="Prix d'achat" type="number" value={values.purchase_price || "0"} onChange={(value) => updateModalValue("purchase_price", value)} />
          <TextField label="Valeur estimée / cible" type="number" value={values.estimated_value || "0"} onChange={(value) => updateModalValue("estimated_value", value)} />
          <TextField label="Prix de revente cible" type="number" value={values.resale_price || "0"} onChange={(value) => updateModalValue("resale_price", value)} />
          <TextField label="Loyer mensuel" type="number" value={values.monthly_rent || "0"} onChange={(value) => updateModalValue("monthly_rent", value)} />
          <TextField label="Charges mensuelles" type="number" value={values.monthly_charges || "0"} onChange={(value) => updateModalValue("monthly_charges", value)} />
          <div className="sm:col-span-2">
            <TextField label="Notes" value={values.notes || ""} onChange={(value) => updateModalValue("notes", value)} />
          </div>
        </div>
      );
    }

    if (formModal.kind === "yield") {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Nom" value={values.name || ""} onChange={(value) => updateModalValue("name", value)} />
          <TextField label="Capital prêté / investi" type="number" value={values.principal || "0"} onChange={(value) => updateModalValue("principal", value)} />
          <TextField label="Taux moyen annuel" type="number" value={values.average_rate || "0"} onChange={(value) => updateModalValue("average_rate", value)} />
          <TextField label="Durée en mois" type="number" value={values.duration_months || "12"} onChange={(value) => updateModalValue("duration_months", value)} />
          <div className="sm:col-span-2">
            <TextField label="Notes" value={values.notes || ""} onChange={(value) => updateModalValue("notes", value)} />
          </div>
        </div>
      );
    }

    if (formModal.kind === "venture") {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Nom" value={values.name || ""} onChange={(value) => updateModalValue("name", value)} />
          <TextField label="Chiffre d'affaires" type="number" value={values.revenue || "0"} onChange={(value) => updateModalValue("revenue", value)} />
          <TextField label="Charges" type="number" value={values.charges || "0"} onChange={(value) => updateModalValue("charges", value)} />
          <TextField label="Levée de fonds" type="number" value={values.fundraising || "0"} onChange={(value) => updateModalValue("fundraising", value)} />
          <TextField label="Dettes" type="number" value={values.debts || "0"} onChange={(value) => updateModalValue("debts", value)} />
          <TextField label="Valorisation" type="number" value={values.valuation || "0"} onChange={(value) => updateModalValue("valuation", value)} />
          <div className="sm:col-span-2">
            <TextField label="Notes" value={values.notes || ""} onChange={(value) => updateModalValue("notes", value)} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-black pb-32 text-white lg:pb-24">
      <WealthToast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <WealthModal
        open={Boolean(formModal)}
        title={formModal?.title || ""}
        description={formModal?.description}
        onClose={closeFormModal}
        footer={
          <>
            <ActionButton variant="secondary" onClick={closeFormModal}>
              Annuler
            </ActionButton>
            <ActionButton onClick={handleSubmitModal} disabled={modalLoading}>
              {modalLoading ? "Enregistrement..." : "Valider"}
            </ActionButton>
          </>
        }
      >
        {renderFormFields()}
      </WealthModal>

      <WealthModal
        open={Boolean(confirmModal)}
        title={confirmModal?.title || ""}
        description={confirmModal?.description}
        eyebrow="Confirmation"
        onClose={() => setConfirmModal(null)}
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => setConfirmModal(null)}>
              Annuler
            </ActionButton>
            <ActionButton variant="danger" onClick={handleConfirmModal} disabled={modalLoading}>
              Supprimer
            </ActionButton>
          </>
        }
      >
        <p className="text-sm text-gray-400">
          Confirme uniquement si tu veux vraiment retirer cet element.
        </p>
      </WealthModal>

      <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Header dashboard={dashboard} onUpgrade={handleUpgradePlan} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 p-4 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)]">
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
                    onClick={() => goToSection(item.key)}
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
              Une vue simple d&apos;abord, les details seulement quand ils aident la decision.
            </p>
          </div>

          {activeSection === "home" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Accueil"
                title="Ton cockpit du jour"
                description="La synthese immediate: patrimoine, score, progression et prochaine action utile."
              />

              <DailyWealthCheck
                score={globalScore}
                gain={globalPortfolioGain}
                product={product}
                opportunitiesCount={opportunitiesCount}
              />

              <section className="rounded-2xl border border-[#3fa9f5]/20 bg-gradient-to-br from-[#08131f] via-black to-[#0b2035] p-6">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.4fr]">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[#3fa9f5]">
                      Patrimoine centralise
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="rounded-full bg-[#3fa9f5]/20 px-4 py-2 text-[#3fa9f5]">
                        {product?.progression?.level || commandCenter?.level || "Starter"}
                      </span>
                      <span className="text-5xl font-black">{globalScore}/100</span>
                    </div>
                    <p className="mt-4 text-gray-400">
                      Plan {product?.plan || dashboard?.plan || "charge"} ·{" "}
                      {product?.progression?.status || "Foundation"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button onClick={() => goToSection("settings")} className={`rounded-2xl border border-white/10 bg-white/5 p-4 text-left ${interactiveCard}`}>
                      <p className="text-xs text-gray-400">Patrimoine global</p>
                      <h3 className="mt-2 text-2xl font-black">
                        {money.format(globalPortfolioValue)} EUR
                      </h3>
                    </button>
                    <button onClick={() => goToSection("investments")} className={`rounded-2xl border border-white/10 bg-white/5 p-4 text-left ${interactiveCard}`}>
                      <p className="text-xs text-gray-400">+/- value</p>
                      <h3 className={`mt-2 text-2xl font-black ${globalPortfolioGainClass}`}>
                        {globalPortfolioGain >= 0 ? "+" : ""}
                        {money.format(globalPortfolioGain)} EUR
                      </h3>
                    </button>
                    <button onClick={() => goToSection("progression")} className={`rounded-2xl border border-white/10 bg-white/5 p-4 text-left ${interactiveCard}`}>
                      <p className="text-xs text-gray-400">Complétion</p>
                      <h3 className="mt-2 text-2xl font-black text-[#3fa9f5]">
                        {product?.data_profile?.completion_percent || 0}%
                      </h3>
                    </button>
                  </div>
                </div>

                {categoryCounts.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {categoryCounts.slice(0, 6).map((item) => (
                    <button
                      key={item.label}
                      onClick={() => goToSection("settings")}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-400">{item.label}</span>{" "}
                      <span className="font-bold text-white">{item.value}</span>
                    </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                      Action utile
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">Prochaines actions</h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    Un petit pas, puis le cockpit devient plus clair.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {(product?.missions || []).slice(0, 3).map((mission) => (
                    <button
                      key={mission.key}
                      onClick={() => {
                        window.location.href = "/progression/challenges";
                      }}
                      className={`rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left ${interactiveCard}`}
                    >
                      <div className="flex h-full flex-col justify-between gap-3">
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
                    </button>
                  ))}

                  {(product?.missions || []).length === 0 && (
                    <p className="text-sm text-gray-400">
                      Aucun signal urgent. Continue a enrichir ton patrimoine tranquillement.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                    Repartition
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Allocation patrimoniale</h2>
                </div>
                {hasModule("diversification") ? (
                  <ExposureBreakdown
                    portfolio={portfolio}
                    realEstate={realEstate}
                    yieldAssets={yieldAssets}
                    ventureAssets={ventureAssets}
                  />
                ) : (
                  <LockedSection
                    title="Allocation avancee"
                    description="Debloque la lecture par exposition pour visualiser les concentrations et les arbitrages prioritaires."
                    onUpgrade={handleUpgradePlan}
                  />
                )}
              </section>

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

              <OpportunityDiscoveryPanel
                universe="investments"
                title="Investment Discovery"
                description="Ethan identifie des pistes d'allocation selon ton horizon, ton risque, ton portefeuille et les signaux de marche disponibles."
                plan={currentPlan}
                token={token}
              />

              {hasModule("diversification") ? (
                <section className="grid grid-cols-1 gap-5">
                  <ExposureBreakdown portfolio={portfolio} realEstate={realEstate} yieldAssets={yieldAssets} ventureAssets={ventureAssets} />
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

              <OpportunityDiscoveryPanel
                universe="real_estate"
                title="Recherche immobiliere patrimoniale"
                description="Residence principale, locatif, achat/revente ou commercial: Ethan priorise rendement, cashflow, risque local et prochaine verification."
                plan={currentPlan}
                token={token}
              />

              <RealEstateModule
                data={realEstate}
                onAdd={handleAddRealEstate}
                onUpdate={handleUpdateRealEstate}
                onDelete={handleDeleteRealEstate}
                opportunity={findOpportunity("real_estate")}
              />
            </div>
          )}

          {activeSection === "ventures" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Business & Ventures"
                title="Entreprises, startups et rendement prive"
                description="Business, startup, activites digitales, franchise, crowdfunding et private equity dans une vue dediee."
              />

              <OpportunityDiscoveryPanel
                universe="business"
                title="Business Opportunity Engine"
                description="Ethan compare business digital, startup, franchise, reprise, crowdfunding et private equity selon ton budget, ton risque et ton ambition."
                plan={currentPlan}
                token={token}
              />

              <YieldInvestmentsModule
                data={yieldAssets}
                onAdd={handleAddYieldAsset}
                onUpdate={handleUpdateYieldAsset}
                onDelete={handleDeleteYieldAsset}
                opportunities={categoryOpportunityItems.filter((item) =>
                  ["crowdfunding", "private_equity"].includes(item.key || "")
                )}
              />

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
            </div>
          )}

          {activeSection === "ai" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Conseiller patrimonial"
                title="ETHAN"
                description="Ton Conseiller exclusif"
              />

              <OpportunitiesModule intelligence={intelligence} />

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

              <section className={`rounded-2xl border border-white/10 bg-zinc-950 p-5 ${interactiveCard}`} onClick={() => { window.location.href = "/progression/challenges"; }}>
                <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                  Missions
                </p>
                <h2 className="mt-2 text-2xl font-bold">Défis, badges et récompenses</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Ouvre le centre de progression pour comprendre les XP, les bonus et les prochains déblocages.
                </p>
              </section>
            </div>
          )}

          {activeSection === "legacy" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Legacy"
                title="Dynasty Office"
                description="Transmission, héritiers, gouvernance familiale, protection et stratégie long terme."
              />

              <LegacyOfficePanel
                data={legacyOverview}
                locked={false}
                onUpgrade={handleUpgradePlan}
              />
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Family Office"
                title="Identite, controle et personnalisation"
                description="Ton centre premium pour le profil, l'abonnement, les preferences et la gouvernance patrimoniale."
              />

              <ProfileReferralPanel
                level={product?.progression?.level || commandCenter?.level || dashboard?.level}
              />

              <WorkspacePanel
                data={workspaces}
                onCreate={handleCreateWorkspace}
                onInvite={handleInviteWorkspaceMember}
                onSwitch={handleSwitchWorkspace}
              />

              <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Preferences</h2>
                    <p className="mt-2 text-sm text-gray-400">
                      Les themes premium sont prepares pour personnaliser
                      l&apos;experience sans alourdir l&apos;interface.
                    </p>
                  </div>
                  <ThemeSwitcher />
                </div>
              </section>

              <section className={`rounded-2xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/5 p-5 ${interactiveCard}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                      Confiance et donnees
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">Privacy Center</h2>
                    <p className="mt-2 text-sm text-gray-400">
                      Gere tes consentements, exports, preferences emails,
                      cookies et demandes de suppression depuis un espace dedie.
                    </p>
                  </div>
                  <ActionButton
                    variant="secondary"
                    onClick={() => {
                      window.location.href = "/privacy-center";
                    }}
                  >
                    Ouvrir
                  </ActionButton>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <h2 className="text-2xl font-bold">Abonnement</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Plan actuel: {product?.plan || dashboard?.plan || "charge"}
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
                  <button
                    onClick={() => handleUpgradePlan("liberty")}
                    className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-black"
                  >
                    Liberty - Sovereign Wealth
                  </button>
                  <button
                    onClick={() => handleUpgradePlan("legacy")}
                    className="rounded-xl border border-amber-300/40 bg-black px-4 py-2 text-sm font-semibold text-amber-200"
                  >
                    Legacy - Dynasty Office
                  </button>
                  <button
                    onClick={handleOpenBillingPortal}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Gerer mon abonnement
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/92 px-2 py-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-3xl gap-1.5 overflow-x-auto">
          {navigation.map((item) => {
            const active = item.key === activeSection;

            return (
              <button
                key={item.key}
                onClick={() => goToSection(item.key)}
                className={`min-w-[70px] rounded-xl border px-2 py-1.5 text-center transition ${
                  active
                    ? "border-[#3fa9f5]/60 bg-[#3fa9f5]/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-gray-400"
                }`}
              >
                <span className="block text-[10px] font-bold leading-tight">
                  {item.label}
                </span>
                {item.locked && (
                  <span className="mt-1 block text-[9px] text-gray-500">
                    lock
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
