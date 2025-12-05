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


// --- FUNÇÃO AJUSTADA COM PLACEHOLDER ---
export const getCategoryImageUrl = (url: string | null | undefined): string => {
    // Se não houver URL, retorna o placeholder
    if (!url || url.trim() === '') {
      return '/images/category-placeholder.png';
    }
    return url; 
};