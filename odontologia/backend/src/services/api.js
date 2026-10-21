const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Não foi possível concluir a operação.");
  }

  return data;
}