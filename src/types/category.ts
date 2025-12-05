export type Category = {
  id: string | number;
  name: string;
  image: string | null; // URL
  parentId: string | null;
  parentName?: string;
  enabled: boolean;
  creationTime?: string;
  children?: Category[];
};


export type CategoryFormData = {
  name: string;
  parentId: string | null;
  enabled: boolean;

  // URL da imagem existente
  existingImageUrl: string | null;

  // arquivo novo, se o usuário trocar a imagem
  newImageFile?: File | null;
};


// --- FUNÇÃO AJUSTADA PARA SUPABASE ---
export const getCategoryImageUrl = (url: string | null | undefined): string => {

    // 2. Como o Supabase já entrega a URL completa, retornamos ela direto.
    // Isso também funciona se no futuro você misturar links externos.
    return url; 
};