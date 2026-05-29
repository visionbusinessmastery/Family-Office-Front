import hashlib
import json
import re
import unicodedata


VISIBLE_STRUCTURE_PATTERNS = [
    r"^\s*(insight|action|next step|next best action|priorite|decision)\s*:",
    r"next best action",
    r"action simple\s*:",
    r"action prioritaire\s*:",
]

LEGACY_CONTENT_PATTERNS = [
    "ton score est",
    "ton score ",
    "score 39/100",
    "pour le cashflow",
    "clarifier la capacite mensuelle",
    "capacite mensuelle disponible",
]


def _stable_index(seed, size):
    if size <= 0:
        return 0
    digest = hashlib.sha256(json.dumps(seed, sort_keys=True, default=str).encode()).hexdigest()
    return int(digest[:8], 16) % size


def _normalize(value) -> str:
    raw = str(value or "").lower()
    normalized = unicodedata.normalize("NFD", raw)
    normalized = "".join(
        char for char in normalized if unicodedata.category(char) != "Mn"
    )
    return (
        normalized
        .replace("\u00c3\u00a9", "e")
        .replace("\u00c3\u00a8", "e")
        .replace("\u00c3\u00aa", "e")
        .replace("\u00c3\u00a0", "a")
        .replace("\u00c3\u00a2", "a")
    )


def looks_legacy_or_structured(text) -> bool:
    normalized = _normalize(text)
    if any(_normalize(pattern) in normalized for pattern in LEGACY_CONTENT_PATTERNS):
        return True
    return any(
        re.search(pattern, normalized, flags=re.IGNORECASE | re.MULTILINE)
        for pattern in VISIBLE_STRUCTURE_PATTERNS
    )


def _context_phrase(context):
    life_context = context.get("life_context") if isinstance(context, dict) else {}
    life_context = life_context if isinstance(life_context, dict) else {}

    if life_context.get("time_constraint") and (
        life_context.get("has_children") or life_context.get("family_constraint")
    ):
        return "avec ton rythme et tes contraintes familiales"
    if life_context.get("time_constraint"):
        return "avec le temps disponible que tu as"
    if life_context.get("expertise"):
        return "en partant de ce que tu sais deja faire"
    if life_context.get("priority_goal"):
        return "en gardant ton objectif principal en face"
    return "avec le contexte disponible"


def build_cognitive_fallback(context, message=None, response_strategy=None, tier=None):
    strategy = response_strategy or {}
    lens = strategy.get("cognitive_lens") or "human_context"
    counter = strategy.get("diversity_counter") or 0
    phrase = _context_phrase(context or {})
    premium = tier not in ["ESSENTIALS", "FREE", "BASIC", None]

    variants = [
        (
            f"Je ne vais pas forcer une analyse artificielle ici. {phrase}, "
            "le mouvement le plus propre est de choisir une avancee tres simple et executable cette semaine."
        ),
        (
            f"Ce que je peux dire proprement, {phrase}, c'est qu'il vaut mieux reduire la charge de decision. "
            "Garde une seule prochaine etape, courte, visible, et facile a verifier."
        ),
        (
            f"Je prefere rester sobre: {phrase}, la bonne suite n'est pas d'ajouter plus d'analyse. "
            "Choisis le petit mouvement qui te rapproche du resultat sans ouvrir un nouveau chantier."
        ),
        (
            f"Le point utile ici, {phrase}, c'est de ne pas transformer la question en plan trop lourd. "
            "Avance sur une action que tu peux terminer avant la fin de semaine."
        ),
    ]
    if premium:
        variants.extend([
            (
                f"Il y a probablement un arbitrage a garder simple: {phrase}, "
                "la meilleure decision est celle qui cree de la clarte sans consommer plus d'energie."
            ),
            (
                f"Je lirais ca avec prudence: {phrase}, une action courte vaut mieux qu'une strategie brillante mais impossible a tenir. "
                "Prends l'option qui demande le moins de friction maintenant."
            ),
        ])

    index = _stable_index({"message": message, "lens": lens, "counter": counter, "tier": tier}, len(variants))
    return variants[index]


def _remove_visible_labels(text):
    lines = []
    for line in str(text or "").splitlines():
        cleaned = line.strip()
        if not cleaned:
            lines.append(line)
            continue
        if any(re.search(pattern, cleaned, flags=re.IGNORECASE) for pattern in VISIBLE_STRUCTURE_PATTERNS):
            cleaned = re.sub(r"^\s*[^:]{1,40}:\s*", "", cleaned).strip()
            cleaned = re.sub(r"next best action\s*:?", "", cleaned, flags=re.IGNORECASE).strip()
            if not cleaned:
                continue
        lines.append(cleaned)
    return "\n".join(lines).strip()


def apply_cognitive_output_layer(text, context=None, message=None, response_strategy=None, tier=None):
    if not text or looks_legacy_or_structured(text):
        return build_cognitive_fallback(context or {}, message, response_strategy, tier)

    cleaned = _remove_visible_labels(text)
    if not cleaned or looks_legacy_or_structured(cleaned):
        return build_cognitive_fallback(context or {}, message, response_strategy, tier)

    # Light pass-through: keep Ethan's answer, only remove excessive template spacing.
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned
