const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export const apiFetch = async (
  url: string,
  token?: string,
  options: RequestInit = {}
) => {
  try {
    return await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    console.error("NETWORK ERROR:", err);
    throw err;
  }
};
