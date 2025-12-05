const API_URL = import.meta.env.VITE_API_URL; // Verifica se isso está lendo


export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  console.log("Tentando buscar em:", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  return response.json();
}
