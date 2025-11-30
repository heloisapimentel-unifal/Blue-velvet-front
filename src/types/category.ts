export type Category = {
  id: string; // Identificador único
  name: string; // Nome da Categoria (obrigatório)
  imageFilename: string; // Nome do arquivo de imagem (ex: 'instrumentos.jpg')
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

// Dados de exemplo iniciais simulando a hierarquia de pais e filhos.
// Os IDs são strings, mas devem ser tratados como BigInt no DB (conforme sua tabela).
export const initialCategories: Category[] = [
  // Categoria Top-level (Pai)
  { id: '100', name: 'Instrumentos Musicais', imageFilename: 'instruments.jpg', parentId: null, parentName: undefined, isEnabled: true, creationTime: '2023-01-01T00:00:00Z' },
  { id: '200', name: 'Mídia e Colecionáveis', imageFilename: 'media.jpg', parentId: null, parentName: undefined, isEnabled: true, creationTime: '2023-01-02T00:00:00Z' },
  
  // Filhos do Instrumentos Musicais (id: 100)
  { id: '101', name: 'Cordas', imageFilename: 'strings.jpg', parentId: '100', parentName: 'Instrumentos Musicais', isEnabled: true, creationTime: '2023-01-01T01:00:00Z' },
  { id: '102', name: 'Percussão', imageFilename: 'drums.jpg', parentId: '100', parentName: 'Instrumentos Musicais', isEnabled: true, creationTime: '2023-01-01T02:00:00Z' },

  // Filhos do Mídia e Colecionáveis (id: 200)
  { id: '201', name: 'Discos de Vinil', imageFilename: 'vinyl.jpg', parentId: '200', parentName: 'Mídia e Colecionáveis', isEnabled: true, creationTime: '2023-01-02T01:00:00Z' },
  { id: '202', name: 'CDs e Cassetes', imageFilename: 'cd.jpg', parentId: '200', parentName: 'Mídia e Colecionáveis', isEnabled: false, creationTime: '2023-01-02T02:00:00Z' },

  // Sub-categoria (Neto)
  { id: '1011', name: 'Guitarras Acústicas', imageFilename: 'acoustic.jpg', parentId: '101', parentName: 'Cordas', isEnabled: true, creationTime: '2023-01-01T03:00:00Z' },
  { id: '1012', name: 'Guitarras Elétricas', imageFilename: 'electric.jpg', parentId: '101', parentName: 'Cordas', isEnabled: true, creationTime: '2023-01-01T04:00:00Z' },
];