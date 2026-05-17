"use client";

import { apiRequest } from "@/lib/api";
import { useDashboard } from "@/hooks/useDashboard";
import type {
  FinanceEntry,
  FinancePayload,
  PortfolioAsset,
  PortfolioPayload,
} from "@/lib/types";

import Header from "@/components/dashboard/Header";
import ChartModule from "@/components/dashboard/ChartModule";
import FinanceModule from "@/components/dashboard/FinanceModule";
import PortfolioModule from "@/components/dashboard/PortfolioModule";
import FinanceBlock from "@/components/finance/FinanceBlock";
import GamificationPanel from "@/components/gamification/GamificationPanel";

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

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

export default function Dashboard() {
  const {
    dashboard,
    portfolio,
    history,
    onboarding,
    finance,
    gamification,
    commandCenter,
    refreshAfterMutation,
    loading,
  } = useDashboard();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Chargement...
      </main>
    );
  }

  const globalScore = commandCenter?.global_score || 0;
  const scoreDetails = commandCenter?.family_office_score?.details || {};
  const scoreAdvice = commandCenter?.advice || [];
  const totalValue = portfolio.reduce(
    (acc, asset) => acc + getAssetValue(asset),
    0
  );
  const initialInvestment = portfolio.reduce(
    (acc, asset) => acc + getAssetCost(asset),
    0
  );

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

  const handleAddPortfolioAsset = async () => {
    const assetName = prompt("Nom de l'actif ? (ex: AAPL, BTC, Appartement)");
    if (!assetName) return;

    const assetType = prompt("Type d'actif ? (ex: STOCK, CRYPTO, REAL_ESTATE)");
    if (!assetType) return;

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

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Header dashboard={dashboard} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <section className="rounded-2xl border border-[#3fa9f5]/20 bg-gradient-to-br from-[#08131f] via-black to-[#0b2035] p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div>
              <p className="text-[#3fa9f5] text-sm uppercase tracking-widest mb-3">
                Family Office OS
              </p>

              <div className="flex items-center gap-4">
                <span className="px-4 py-2 rounded-full bg-[#3fa9f5]/20 text-[#3fa9f5]">
                  {commandCenter?.level || "Starter"}
                </span>

                <span className="text-5xl font-black">{globalScore}/100</span>
              </div>

              <p className="text-gray-400 mt-4">
                Plan {dashboard?.plan || "FREE"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-xs">Portfolio</p>
                <h3 className="text-2xl font-bold">
                  {money.format(totalValue)} EUR
                </h3>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-xs">Assets</p>
                <h3 className="text-2xl font-bold">{portfolio.length}</h3>
              </div>
            </div>
          </div>
        </section>

        <GamificationPanel gamification={gamification || undefined} />

        <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
          <h2 className="text-2xl font-bold mb-4">
            Global Command Center Score
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#3fa9f5]/10 p-5 rounded-2xl">
              <p className="text-sm text-gray-400">Richesse</p>
              <h3 className="text-3xl font-black text-[#3fa9f5]">
                {scoreDetails.wealth || 0}/100
              </h3>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl">
              <p className="text-sm text-gray-400">Diversification</p>
              <h3 className="text-3xl font-black">
                {scoreDetails.diversification || 0}/100
              </h3>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl">
              <p className="text-sm text-gray-400">Dette</p>
              <h3 className="text-3xl font-black">
                {scoreDetails.debt ?? scoreDetails.debt_risk_score ?? 0}/100
              </h3>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl">
              <p className="text-sm text-gray-400">Activite</p>
              <h3 className="text-3xl font-black">
                {scoreDetails.activity || 0}/100
              </h3>
            </div>
          </div>

          <div className="mt-6 bg-[#3fa9f5]/10 p-5 rounded-2xl">
            <h3 className="text-[#3fa9f5] font-bold mb-3">
              Recommandations IA
            </h3>

            <div className="space-y-2">
              {scoreAdvice.length > 0 ? (
                scoreAdvice.map((advice, index) => (
                  <p key={`${advice}-${index}`} className="text-gray-300">
                    {advice}
                  </p>
                ))
              ) : (
                <p className="text-gray-400">Aucune recommandation.</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold">Situation</h2>

            <button
              onClick={handleUpdateOnboarding}
              className="bg-[#3fa9f5] px-4 py-2 rounded-xl"
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

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <FinanceBlock
            title="Revenus"
            type="revenus"
            data={finance.revenus}
            onCreate={handleAddFinance}
            onDelete={handleDeleteFinance}
            onUpdate={handleUpdateFinance}
          />

          <FinanceBlock
            title="Charges"
            type="charges"
            data={finance.charges}
            onCreate={handleAddFinance}
            onDelete={handleDeleteFinance}
            onUpdate={handleUpdateFinance}
          />

          <FinanceBlock
            title="Epargne"
            type="epargne"
            data={finance.epargne}
            onCreate={handleAddFinance}
            onDelete={handleDeleteFinance}
            onUpdate={handleUpdateFinance}
          />

          <FinanceBlock
            title="Dettes"
            type="dettes"
            data={finance.dettes}
            onCreate={handleAddFinance}
            onDelete={handleDeleteFinance}
            onUpdate={handleUpdateFinance}
          />
        </section>

        <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
          <h2 className="text-2xl font-bold mb-4">Chart</h2>
          <ChartModule
            history={history}
            initialInvestment={initialInvestment}
          />
        </section>

        <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
          <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
          <PortfolioModule
            portfolio={portfolio}
            onAdd={handleAddPortfolioAsset}
            onUpdate={handleUpdatePortfolioAsset}
            onDelete={handleDeletePortfolioAsset}
          />
        </section>
      </div>
    </main>
  );
}
