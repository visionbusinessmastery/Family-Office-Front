import json
import unicodedata


ETHAN_CORE_SYSTEM = "ETHAN_CORE_V4"
CORE_UNAVAILABLE_ANALYSIS = (
    "Je n'ai pas assez de contexte exploitable pour produire une reponse fiable maintenant. "
    "Repose ta question en une phrase simple: je repartirai du contexte backend actuel."
)

LEGACY_ETHAN_RESPONSE_PATTERNS = [
    "ton score est",
    "ton score ",
    "score 39/100",
    "pour le cashflow",
    "action simple",
    "action prioritaire",
    "priorite:",
    "priorité:",
    "clarifier la capacite",
    "capacite mensuelle disponible",
    "capacité mensuelle disponible",
]


def with_core_contract(result, mode: str):
    if not isinstance(result, dict):
        result = {"analysis": str(result or CORE_UNAVAILABLE_ANALYSIS)}

    next_result = dict(result)
    analysis = str(next_result.get("analysis") or "").strip()
    if not analysis or is_legacy_ethan_response(analysis):
        analysis = CORE_UNAVAILABLE_ANALYSIS

    next_result["analysis"] = analysis
    next_result["source"] = "ethan_core"
    next_result["mode"] = mode
    next_result["system"] = ETHAN_CORE_SYSTEM
    return next_result


def normalize_legacy_text(value) -> str:
    if isinstance(value, (dict, list)):
        raw = json.dumps(value, ensure_ascii=False, default=str)
    else:
        raw = str(value or "")

    normalized = unicodedata.normalize("NFD", raw.lower())
    normalized = "".join(
        char for char in normalized if unicodedata.category(char) != "Mn"
    )

    return (
        normalized
        .replace("é", "e")
        .replace("è", "e")
        .replace("ê", "e")
        .replace("à", "a")
        .replace("â", "a")
        .replace("î", "i")
        .replace("ô", "o")
        .replace("û", "u")
    )


def is_legacy_ethan_response(value) -> bool:
    normalized = normalize_legacy_text(value)
    return any(
        normalize_legacy_text(pattern) in normalized
        for pattern in LEGACY_ETHAN_RESPONSE_PATTERNS
    )


def get_context_score(context):
    score = context.get("global_score") or context.get("score", 0)

    if isinstance(score, dict):
        return score.get("score", 0)

    return score


def get_llm_response(
    messages,
    model,
    max_output_tokens,
    *,
    stable_hash_fn,
    get_cache_fn,
    set_cache_fn,
    estimate_tokens_fn,
    is_model_configured_fn,
    chat_completion_fn,
    fallback_model,
):
    import json

    prompt_hash = stable_hash_fn({"messages": messages, "model": model, "max": max_output_tokens})
    llm_cache_key = f"llm:{prompt_hash}"

    cached = get_cache_fn(llm_cache_key)
    if cached and not is_legacy_ethan_response(cached):
        return cached, True, estimate_tokens_fn(json.dumps(messages)), estimate_tokens_fn(cached), model

    if not is_model_configured_fn():
        return None, False, estimate_tokens_fn(json.dumps(messages)), 0, model

    def _call(selected_model, token_param="max_completion_tokens"):
        kwargs = {
            "model": selected_model,
            "messages": messages,
            token_param: max_output_tokens,
        }
        return chat_completion_fn(**kwargs)

    response = None

    try:
        response = _call(model)
    except Exception:
        try:
            response = _call(fallback_model)
            model = fallback_model
        except Exception:
            try:
                response = _call(fallback_model, "max_tokens")
                model = fallback_model
            except Exception:
                return None, False, estimate_tokens_fn(json.dumps(messages)), 0, model

    try:
        llm_text = response.choices[0].message.content
        usage = getattr(response, "usage", None)
        input_tokens = getattr(usage, "prompt_tokens", None) or estimate_tokens_fn(json.dumps(messages))
        output_tokens = getattr(usage, "completion_tokens", None) or estimate_tokens_fn(llm_text)
        if not is_legacy_ethan_response(llm_text):
            set_cache_fn(llm_cache_key, llm_text, ttl=1800)
        return llm_text, False, input_tokens, output_tokens, model
    except Exception:
        return None, False, estimate_tokens_fn(json.dumps(messages)), 0, model


def _fallback_focus(message: str) -> str:
    normalized = (message or "").lower()
    if any(word in normalized for word in ["immobilier", "residence", "locatif", "loyer", "travaux"]):
        return "real_estate"
    if any(word in normalized for word in ["opportunite", "opportunites", "deal", "signal", "source"]):
        return "opportunities"
    if any(word in normalized for word in [
        "business",
        "entreprise",
        "startup",
        "franchise",
        "reprise",
        "marketing",
        "communication",
        "commerce",
        "client",
        "offre",
        "vente",
        "revenu",
        "revenus",
    ]):
        return "business"
    if any(word in normalized for word in ["cashflow", "charge", "charges", "epargne", "budget", "liquidite", "tresorerie"]):
        return "cashflow"
    if any(word in normalized for word in ["risque", "concentration", "exposition", "diversification"]):
        return "risk"
    if any(word in normalized for word in ["portfolio", "portefeuille", "action", "etf", "crypto", "forex"]):
        return "portfolio"
    if any(word in normalized for word in ["legacy", "heritage", "transmission", "famille", "gouvernance"]):
        return "legacy"
    if any(word in normalized for word in ["score", "progression", "xp", "badge", "mission"]):
        return "progression"
    return "general"


def _opportunity_count(opportunities) -> int:
    return (
        len(opportunities)
        if isinstance(opportunities, list)
        else opportunities.get("count", 0)
        if isinstance(opportunities, dict)
        else 0
    )


def _top_portfolio_exposure(portfolio, compact_portfolio_fn) -> str:
    compact = compact_portfolio_fn(portfolio)
    exposures = compact.get("exposures") or {}
    if not exposures:
        return "aucune poche dominante encore visible"

    top_name, top_value = next(iter(exposures.items()))
    total = compact.get("total_value") or 0
    share = round((float(top_value or 0) / float(total or 1)) * 100)
    return f"{top_name} ({share}% environ)"


def _allows_premium_depth(tier: str) -> bool:
    return tier not in ["ESSENTIALS", "FREE", "BASIC", None]


def build_fallback_response(
    context,
    opportunities,
    tier="ESSENTIALS",
    message=None,
    portfolio=None,
    response_strategy=None,
    compact_portfolio_fn=None,
    build_response_strategy_fn=None,
):
    score = get_context_score(context)
    opportunity_count = _opportunity_count(opportunities)
    focus = _fallback_focus(message or "")
    top_exposure = (
        _top_portfolio_exposure(portfolio or {}, compact_portfolio_fn)
        if compact_portfolio_fn
        else "aucune poche dominante encore visible"
    )
    life_context = context.get("life_context") or {}
    has_family_load = bool(life_context.get("has_children") or life_context.get("family_constraint"))
    time_constraint = life_context.get("time_constraint")
    expertise = life_context.get("expertise")
    goal = life_context.get("priority_goal") or life_context.get("motivation")
    business_hint = life_context.get("business_context") or (
        "business existant" if life_context.get("businesses") else None
    )
    if not response_strategy and build_response_strategy_fn:
        response_strategy = build_response_strategy_fn(message or "", {})
    response_strategy = response_strategy or {}
    output_style = response_strategy.get("output_style") or "quiet_analyst"
    cognitive_lens = response_strategy.get("cognitive_lens") or "human_context"

    context_intro = "Dans ta situation"
    if has_family_load and time_constraint:
        context_intro = "Avec une charge familiale et peu de temps"
    elif time_constraint:
        context_intro = "Avec peu de temps disponible"
    elif expertise:
        context_intro = f"En partant de ton expertise {expertise}"

    revenue_lever = (
        f"{context_intro}, le levier le plus realiste est de monetiser une competence deja presente"
        if expertise
        else f"{context_intro}, le levier le plus realiste est de choisir une action qui n'ajoute pas trop de complexite"
    )
    if goal and "revenu" in str(goal).lower():
        revenue_lever += " pour augmenter les revenus sans disperser ton energie"
    if business_hint:
        revenue_lever += " et de l'adosser a ton activite existante"

    responses = {
        "real_estate": (
            "Le point delicat avec l'immobilier, ce n'est pas seulement le prix d'achat. C'est surtout la charge que l'actif impose ensuite. "
            "Je regarderais un seul bien comparable, en incluant charges, vacance et travaux, avant d'aller plus loin."
        ),
        "opportunities": (
            f"Il y a {opportunity_count} piste(s) visibles, mais le vrai gain vient du tri, pas du volume. "
            "Garde seulement celle qui ameliore une faiblesse claire sans ajouter de complexite inutile."
        ),
        "cashflow": (
            "Le sujet n'est pas d'analyser davantage, mais de choisir le levier de revenu le moins lourd a executer. "
            f"{revenue_lever}. "
            "Tu peux tester une action revenue courte, mesurable, et compatible avec ton quotidien."
        ),
        "risk": (
            "Une opportunite attractive peut devenir fragile si elle renforce deja ta poche dominante. "
            f"Le point de risque principal semble etre la concentration: ta poche dominante est {top_exposure}. "
            "Avant d'ajouter une ligne, garde une limite claire sur ce que cette poche peut representer."
        ),
        "portfolio": (
            "Le portefeuille doit raconter une these, pas seulement additionner des actifs. "
            f"Pour le portefeuille, je regarderais d'abord l'allocation plutot que le prochain actif. Ta poche la plus visible est {top_exposure}. "
            "La prochaine position devrait avoir un role net: stabiliser, diversifier, produire du revenu ou chercher de la valorisation."
        ),
        "business": (
            "Si une expertise existe deja, le meilleur levier est souvent une offre plus nette, pas un nouveau projet. "
            f"{revenue_lever}. "
            "Je testerais une promesse courte orientee PME ou independants: un audit marketing express, limite dans le temps, qui peut se vendre sans alourdir tes soirees."
        ),
        "legacy": (
            "En Legacy, la vraie performance est la continuite, pas seulement la croissance. "
            "Pour la partie Legacy, l'objectif n'est pas d'aller vite mais de rendre le patrimoine plus transmissible et moins dependant de toi. "
            "Le mouvement utile serait de rendre visibles les beneficiaires, documents essentiels et roles familiaux."
        ),
        "progression": (
            "La prochaine progression doit etre verifiable par le backend, sinon elle reste une intention. "
            "Pour progresser, l'action la plus rentable est souvent la donnee manquante la plus simple. "
            "Choisis une mission concrete et mesurable aujourd'hui plutot qu'une grande refonte."
        ),
        "general": (
            "La bonne decision est celle qui respecte ton contexte reel avant d'optimiser le patrimoine. "
            f"{revenue_lever}. Je vois {opportunity_count} opportunite(s), mais je ne les mettrais pas toutes au meme niveau. "
            "Le plus propre serait de choisir une seule avancee compatible avec ton temps reel cette semaine."
        ),
    }
    analysis = responses.get(focus, responses["general"])
    if _allows_premium_depth(tier) and cognitive_lens == "question":
        analysis = "La vraie question ici est de savoir quelle decision allege la suite au lieu de l'alourdir. " + analysis
    elif _allows_premium_depth(tier) and cognitive_lens == "insight":
        analysis = "Le signal interessant, c'est que la meilleure avancee n'est pas forcement la plus spectaculaire. " + analysis
    elif _allows_premium_depth(tier) and cognitive_lens == "human_context":
        analysis = analysis.replace("La bonne decision", "La bonne decision, dans ton rythme reel,")
    if _allows_premium_depth(tier) and output_style == "human_coach":
        analysis = analysis.replace("Je regarderais", "Tu peux regarder")
    elif _allows_premium_depth(tier) and output_style == "risk_lens" and focus not in ["risk", "real_estate"]:
        analysis += " Ce qui merite attention, c'est de ne pas ajouter une decision qui augmente ta charge mentale."
    elif _allows_premium_depth(tier) and output_style == "action_trigger":
        natural_triggers = {
            "real_estate": "Prends un seul dossier comparable et regarde-le avec charges, vacance et travaux avant d'en ouvrir un deuxieme.",
            "opportunities": "Mets les pistes secondaires en attente et avance seulement sur celle qui peut etre testee cette semaine.",
            "cashflow": "Teste une petite action de revenu que tu peux executer sans changer ton rythme quotidien.",
            "risk": "Fixe une limite d'exposition avant toute nouvelle position.",
            "portfolio": "Donne un role clair a la prochaine ligne avant de l'ajouter.",
            "business": "Formule l'offre en une phrase et teste-la avant de construire plus lourd.",
            "legacy": "Rends visibles les beneficiaires et les documents essentiels avant d'ajouter de nouvelles optimisations.",
            "progression": "Choisis une mission mesurable que le backend pourra verifier, puis laisse le reste pour plus tard.",
            "general": "Garde une seule avancee concrete pour cette semaine, compatible avec ton temps reel.",
        }
        analysis += " " + natural_triggers.get(focus, natural_triggers["general"])

    return {
        "analysis": analysis,
        "context_score": score,
        "tier": tier,
        "focus": focus,
        "autopilot": None,
    }
