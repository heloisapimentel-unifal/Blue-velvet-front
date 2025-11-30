export type Category = {
  id: string; // Identificador único
  name: string; // Nome da Categoria (obrigatório)
  imageFilename: string; // Nome do arquivo de imagem (ex: 'jorge1' ou 'jorge2')
  parentId: string | null; // ID da Categoria Pai (null se for principal)
  parentName?: string; // Nome da Categoria Pai (para exibição na tabela, opcional na tabela, mas útil)
  isEnabled: boolean; // Status (habilitada/desabilitada)
  creationTime: string;
};

export type CategoryFormData = {
  name: string;
  imageFilename: string;
  parentId: string | null;
  isEnabled: boolean;
};

// Mapa para garantir que os nomes de arquivo usem o caminho da pasta public/images/
const JORGE_IMAGE_FILES = {
    'jorge1': '/images/jorge1.png', // Caminho corrigido para public/images
    'jorge2': '/images/jorge2.png'  // Caminho corrigido para public/images
};

export const initialCategories: Category[] = [
  // Categoria Top-level (Pai)
  { id: '100', name: 'Instrumentos Musicais', imageFilename: 'jorge1', parentId: null, parentName: undefined, isEnabled: true, creationTime: '2023-01-01T00:00:00Z' },
  { id: '200', name: 'Mídia e Colecionáveis', imageFilename: 'jorge2', parentId: null, parentName: undefined, isEnabled: true, creationTime: '2023-01-02T00:00:00Z' },
  
  // Filhos do Instrumentos Musicais (id: 100)
  { id: '101', name: 'Cordas', imageFilename: 'jorge1', parentId: '100', parentName: 'Instrumentos Musicais', isEnabled: true, creationTime: '2023-01-01T01:00:00Z' },
  { id: '102', name: 'Percussão', imageFilename: 'jorge2', parentId: '100', parentName: 'Instrumentos Musicais', isEnabled: true, creationTime: '2023-01-01T02:00:00Z' },

  // Filhos do Mídia e Colecionáveis (id: 200)
  { id: '201', name: 'Discos de Vinil', imageFilename: 'jorge1', parentId: '200', parentName: 'Mídia e Colecionáveis', isEnabled: true, creationTime: '2023-01-02T01:00:00Z' },
  { id: '202', name: 'CDs e Cassetes', imageFilename: 'jorge2', parentId: '200', parentName: 'Mídia e Colecionáveis', isEnabled: false, creationTime: '2023-01-02T02:00:00Z' },

  // Sub-categoria (Neto)
  { id: '1011', name: 'Guitarras Acústicas', imageFilename: 'jorge1', parentId: '101', parentName: 'Cordas', isEnabled: true, creationTime: '2023-01-01T03:00:00Z' },
  { id: '1012', name: 'Guitarras Elétricas', imageFilename: 'jorge2', parentId: '101', parentName: 'Cordas', isEnabled: true, creationTime: '2023-01-01T04:00:00Z' },
];

// Função utilitária para gerar o URL da imagem, apontando para a pasta public/images
export const getCategoryImageUrl = (filename: string): string => {
    const filePath = JORGE_IMAGE_FILES[filename as keyof typeof JORGE_IMAGE_FILES];
    // Retorna o caminho local (/images/jorgeX.png) ou um placeholder genérico caso não encontre
    return filePath || '/images/placeholder.png'; 
}