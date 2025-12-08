import { Category } from "@/types/category";

const API_URL = "http://localhost:8080/category";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Ajuste conforme onde você salva o token
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// --- GET ---
export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Erro ao buscar categorias");
  return response.json();
}

// --- CREATE ---
export const createCategory = async (categoryData: any, imageFile?: File | null): Promise<Category> => {
  const formData = new FormData();

  // 1. Monta o JSON igual o Java espera na parte "category"
  const categoryPayload = {
    name: categoryData.name,
    parentId: categoryData.parentId,
    enabled: categoryData.enabled
  };

  // 1. JSON
  formData.append("category", JSON.stringify(categoryPayload));

  // 2. Imagem (se houver)
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro ao criar categoria");
  }

  return response.json();
};

// --- UPDATE ---
export const updateCategory = async (id: string | number, categoryData: any, imageFile?: File | null): Promise<Category> => {
  const formData = new FormData();

  const categoryPayload = {
    name: categoryData.name,
    parentId: categoryData.parentId,
    enabled: categoryData.enabled
  };

  formData.append("category", JSON.stringify(categoryPayload));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro ao atualizar categoria");
  }

  return response.json();
};


// --- DELETE ---
export const deleteCategory = async (id: string | number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    }
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir categoria");
  }
};

// --- RESET DATABASE (NOVO) ---
export const resetDatabase = async (): Promise<void> => {
  // ATENÇÃO: Verifique se o seu backend usa o endpoint "/reset" e o método POST
  const response = await fetch(`${API_URL}/reset`, {
    method: 'POST', 
    headers: {
      ...getAuthHeaders(),
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro ao resetar o banco de dados");
  }
};