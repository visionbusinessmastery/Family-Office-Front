"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";

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

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Pose-moi une question sur ton portefeuille, tes risques, tes opportunites ou les prochaines actions prioritaires.",
  },
];

export default function AdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
      const data = await apiRequest<AdvisorResponse>("/advisor", token, {
        method: "POST",
        body: JSON.stringify({ message: question }),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.result?.analysis ||
            "Je n'ai pas encore assez de contexte pour repondre clairement.",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Impossible de joindre l'IA pour le moment. Reessaie dans quelques instants.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Assistant IA</h2>
        <p className="text-sm text-gray-400">
          Discussion contextualisee avec ton profil financier
        </p>
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
          Envoyer
        </button>
      </form>
    </section>
  );
}
