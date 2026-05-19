"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { GamificationData } from "@/lib/types";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AdvisorResponse = {
  result?: {
    analysis?: string;
    context_score?: number;
  };
};

type AdvisorChatProps = {
  recommendations?: string[];
  aiCoach?: GamificationData["ai_coach"];
  notification?: GamificationData["notification"];
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Je suis Beacon. Pose-moi une question sur ton patrimoine, tes risques, tes opportunites ou ta prochaine action utile.",
  },
];

export default function AdvisorChat({
  recommendations = [],
  aiCoach,
  notification,
}: AdvisorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const affiliations = aiCoach?.affiliations || [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: question },
    ]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiRequest<AdvisorResponse>("/advisor/advisor", token, {
        method: "POST",
        body: JSON.stringify({ message: question }),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.result?.analysis ||
            "Je n'ai pas encore assez de contexte pour te guider clairement.",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Je n'arrive pas a joindre le moteur de guidance pour le moment. Reessaie dans quelques instants.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Beacon</h2>
        <p className="text-sm text-gray-400">
          Ton copilote patrimonial pour transformer le contexte en actions simples.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#3fa9f5]/10 border border-[#3fa9f5]/20 rounded-2xl p-4">
          <h3 className="font-bold text-[#3fa9f5] mb-3">
            Conseils prioritaires
          </h3>

          <div className="space-y-2">
            {recommendations.length > 0 ? (
              recommendations.map((advice, index) => (
                <p key={`${advice}-${index}`} className="text-sm text-gray-300">
                  {advice}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                Aucun conseil prioritaire pour le moment.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="font-bold text-white mb-2">Mentor</h3>

          <p className="text-sm text-gray-300 leading-relaxed">
            {aiCoach?.message ||
              "Continue a completer ton cockpit: chaque donnee rend les conseils plus precis."}
          </p>

          {affiliations.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase text-gray-500">
                Affiliations suggerees
              </p>
              {affiliations.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-lg border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
          <h3 className="font-bold text-blue-400 mb-2">Notification</h3>

          <p className="text-sm text-white">
            {notification?.title || "Aucune notification"}
          </p>

          {notification?.message && (
            <p className="text-xs text-gray-400 mt-1">
              {notification.message}
            </p>
          )}
        </div>
      </div>

      <div className="h-80 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-[#3fa9f5] text-white"
                  : "bg-white/10 text-gray-200"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-400">Analyse en cours...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ex: ou suis-je trop expose ?"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3fa9f5]"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-[#3fa9f5] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          Demander
        </button>
      </form>
    </section>
  );
}
