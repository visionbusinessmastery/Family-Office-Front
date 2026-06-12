# =========================
# LEGACY COMMAND CENTER COMPATIBILITY WRAPPER
# =========================

from intelligence.api.global_command_center import (  # noqa: F401
    MODULE_WEIGHTS,
    compute_global_command_center,
    compute_level,
)


__all__ = [
    "MODULE_WEIGHTS",
    "compute_global_command_center",
    "compute_level",
]
