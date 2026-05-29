ETHAN_CORE_SYSTEM = "ETHAN_CORE_V4"


def with_core_contract(result, mode: str):
    if not isinstance(result, dict):
        return result

    next_result = dict(result)
    next_result["source"] = "ethan_core"
    next_result["mode"] = mode
    next_result["system"] = ETHAN_CORE_SYSTEM
    return next_result
