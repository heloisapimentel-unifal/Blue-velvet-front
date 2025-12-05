import { Input } from '@/components/ui/input';
import { useMemo } from 'react'; // 1. Adicione este import
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Category, 
  CategoryFormData 
} from '@/types/category'; 
// Remoção: useMemo e types de Hierarquia não são mais necessários

interface CategoryFormProps {
  formData: CategoryFormData;
  setFormData: (data: CategoryFormData) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  // ----------------------------------------
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  allCategories: Category[]; 
  currentCategoryId?: string | number; 
}

const CategoryForm = ({ 
  formData, 
  setFormData, 
  selectedFile,      // Recebe o arquivo
  setSelectedFile,   // Função para setar o arquivo
  onSubmit, 
  onCancel, 
  isEditing, 
  allCategories,
  currentCategoryId
}: CategoryFormProps) => {

  // Função auxiliar para converter o valor do Select (string) para string | null 
  // e vice-versa para o formData.parentId
  const handleparentIdChange = (value: string) => {
    const newparentId = value === 'none' ? null : value;
    setFormData({ ...formData, parentId: newparentId });
  };
  
  const hierarchicalOptions = useMemo(() => {
    // 1. Pega apenas as raízes (quem não tem pai definido)
    // Isso evita que subcategorias apareçam duplicadas no nível 0
    const rootCategories = allCategories.filter(c => !c.parentId);

    // 2. Função recursiva para achatar a árvore e adicionar prefixos
    const flatten = (categories: Category[], level = 0): { id: string; name: string }[] => {
      let options: { id: string; name: string }[] = [];
      
      // Ordena alfabeticamente
      const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));

      for (const cat of sorted) {
        // PULA a própria categoria que está sendo editada 
        // (ela não pode ser pai dela mesma, nem seus filhos podem ser seus pais)
        if (String(cat.id) === String(currentCategoryId)) continue;

        // Cria o prefixo visual (ex: "— — ")
        const prefix = level > 0 ? "— ".repeat(level) : "";
        
        options.push({
          id: cat.id.toString(),
          name: `${prefix}${cat.name}`
        });

        // Se tiver filhos, processa eles recursivamente
        if (cat.children && cat.children.length > 0) {
          options = [...options, ...flatten(cat.children, level + 1)];
        }
      }
      return options;
    };

    return flatten(rootCategories);
  }, [allCategories, currentCategoryId]);

  // Filtra as categorias para que a categoria em edição não seja selecionada como sua própria pai.
  // Isso impede que a lista contenha a própria categoria.
  const availableParentCategories = allCategories.filter(
    (cat) => cat.id !== currentCategoryId
  );
  
  // Remoção: getHierarchicalOptions e useMemo

  return (
    // max-h-[70vh] e overflow-y-auto adicionados para garantir rolagem no Dialog se necessário
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
          Informações da Categoria
        </h4>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nome *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Guitarras Acústicas"
          />
        </div>

        {/* INPUT DE ARQUIVO (MODIFICADO) */}
        <div className="space-y-2">
          <label htmlFor="image">Imagem da Categoria</label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            className="cursor-pointer"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          {/* Feedback do arquivo selecionado */}
          {selectedFile ? (
            <p className="text-sm text-green-600 font-medium">
              Arquivo selecionado: {selectedFile.name}
            </p>
          ) : isEditing && formData.existingImageUrl ? (
            <p className="text-xs text-muted-foreground">
              Imagem atual: {formData.existingImageUrl} (Envie outra para substituir)
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Categoria Pai (Opcional)</label>
          <Select
            // O Select do Shadcn precisa de uma string, então convertemos null para 'null'
            value={formData.parentId === null ? 'null' : formData.parentId}
            onValueChange={handleparentIdChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria superior" />
            </SelectTrigger>
            <SelectContent>
              {/* Opção para ser uma Categoria Principal */}
              <SelectItem value="null">
                (Categoria Principal / Top-level)
              </SelectItem>
              {/* Lista de categorias existentes (agora plana e simples) */}
              {hierarchicalOptions.map((opt) => (
                <SelectItem 
                    key={opt.id} 
                    value={opt.id}                
                  >
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
          Status
        </h4>
        
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isEnabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, enabled: checked as boolean })
              }
            />
            <label htmlFor="isEnabled" className="text-sm font-medium text-foreground cursor-pointer">
              Ativa (Pode ser exibida na loja)
            </label>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 sticky bottom-0 bg-card">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CategoryForm;