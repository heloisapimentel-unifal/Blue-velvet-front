import { Product } from "@/types/product";

const API_URL = "http://localhost:8080/products";

export async function getAllProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Erro ao buscar produtos");
  return response.json();
}

// --- CREATE (Multipart) ---
export const createProduct = async (productData: any, imageFile?: File | null): Promise<Product> => {
  const formData = new FormData();

  // 1. Anexa o JSON como String (Requisito do seu Backend)
  // Verifique se o nome 'product' bate com o @RequestPart("product") do Java
  formData.append("product", JSON.stringify(productData));

  // 2. Anexa a imagem se houver
  // Verifique se o nome 'image' bate com o @RequestPart("image") do Java
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    // IMPORTANTE: Não defina 'Content-Type': 'multipart/form-data' aqui!
    // Deixe o browser definir isso automaticamente para gerar o 'boundary'.
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro ao criar produto");
  }

  return response.json();
};

// --- UPDATE (Multipart) ---
export const updateProduct = async (id: number | string, productData: any, imageFile?: File | null): Promise<Product> => {
  const formData = new FormData();

  formData.append("product", JSON.stringify(productData));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT', // Certifique-se que seu backend aceita PUT com multipart, senão use POST para update também
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro ao atualizar produto");
  }

  return response.json();
};

export const deleteProduct = async (id: number | string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error("Erro ao excluir produto");
};