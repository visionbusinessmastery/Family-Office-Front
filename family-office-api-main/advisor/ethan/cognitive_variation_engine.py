import hashlib
import json


ENTRY_MODES = [
    "insight_first",
    "action_first",
    "risk_first",
    "question_first",
    "observation_first",
]

DENSITY_MODES = ["short", "medium", "dense"]

TRANSITION_MODES = [
    "direct",
    "soft_pivot",
    "contrast",
    "compression",
    "quiet_challenge",
]

RHYTHM_MODES = ["single_breath", "two_step", "compact_detail"]


def _stable_index(seed, size):
    if size <= 0:
        return 0
    digest = hashlib.sha256(json.dumps(seed, sort_keys=True, default=str).encode()).hexdigest()
    return int(digest[:8], 16) % size


def _rotate(options, previous, seed):
    candidates = [item for item in options if item != previous] or list(options)
    return candidates[_stable_index(seed, len(candidates))]


def build_cognitive_variation(message, memory=None, response_strategy=None, response_data=None):
    """
    Data-only variation controller.

    It never writes user-facing text. It selects the shape that the output
    renderer must use so Ethan varies entry point, density, rhythm and
    transition without changing backend truth.
    """
    profile = memory.get("context_profile") if isinstance(memory, dict) else {}
    profile = profile if isinstance(profile, dict) else {}
    strategy = response_strategy or {}
    response_data = response_data or {}

    previous_entry = profile.get("last_variation_entry")
    previous_density = profile.get("last_variation_density")
    previous_transition = profile.get("last_variation_transition")
    previous_rhythm = profile.get("last_variation_rhythm")
    diversity_counter = int(profile.get("response_diversity_counter") or 0)

    base_seed = {
        "message": message,
        "counter": diversity_counter,
        "intent": strategy.get("primary_intent"),
        "lens": strategy.get("cognitive_lens"),
        "status": response_data.get("status"),
    }

    entry_mode = _rotate(ENTRY_MODES, previous_entry, {**base_seed, "axis": "entry"})
    density = _rotate(DENSITY_MODES, previous_density, {**base_seed, "axis": "density"})
    transition = _rotate(TRANSITION_MODES, previous_transition, {**base_seed, "axis": "transition"})
    rhythm = _rotate(RHYTHM_MODES, previous_rhythm, {**base_seed, "axis": "rhythm"})

    # Prevent the classic repeated analysis -> action shape.
    if previous_entry == "insight_first" and entry_mode == "action_first":
        entry_mode = _rotate(
            ["risk_first", "question_first", "observation_first"],
            previous_entry,
            {**base_seed, "axis": "anti_analysis_action"},
        )

    return {
        "entry_mode": entry_mode,
        "density": density,
        "transition": transition,
        "rhythm": rhythm,
        "previous_entry_mode": previous_entry,
        "previous_density": previous_density,
        "previous_transition": previous_transition,
        "previous_rhythm": previous_rhythm,
        "variation_signature": f"{entry_mode}:{density}:{transition}:{rhythm}",
    }
