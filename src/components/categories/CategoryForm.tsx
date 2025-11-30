import { Input } from '@/components/ui/input';
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
  CategoryFormData, 
  initialCategories // Lista de todas as categorias para o Select ParentId
} from '@/types/category'; 
// Remoção: useMemo e types de Hierarquia não são mais necessários

interface CategoryFormProps {
  formData: CategoryFormData;
  setFormData: (data: CategoryFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  // A lista de categorias existentes é necessária para o dropdown de "Categoria Pai"
  allCategories: Category[]; 
  // Opcional: Se estiver editando, excluímos a categoria atual da lista de pais
  currentCategoryId?: string; 
}

const CategoryForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEditing, 
  allCategories,
  currentCategoryId
}: CategoryFormProps) => {

  // Função auxiliar para converter o valor do Select (string) para string | null 
  // e vice-versa para o formData.parentId
  const handleParentIdChange = (value: string) => {
    // Se o valor for 'null' (opção de Categoria Principal), armazena como null
    const newParentId = value === 'null' ? null : value;
    setFormData({ ...formData, parentId: newParentId });
  };
  
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nome do Arquivo da Imagem *</label>
          <Input
            value={formData.imageFilename}
            onChange={(e) => setFormData({ ...formData, imageFilename: e.target.value })}
            placeholder="Ex: guitarras_acusticas.jpg"
            title="Apenas o nome do arquivo da imagem é armazenado."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Categoria Pai (Opcional)</label>
          <Select
            // O Select do Shadcn precisa de uma string, então convertemos null para 'null'
            value={formData.parentId === null ? 'null' : formData.parentId}
            onValueChange={handleParentIdChange}
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
              {availableParentCategories.map((cat) => (
                <SelectItem 
                    key={cat.id} 
                    value={cat.id} 
                >
                  {cat.name}
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
              checked={formData.isEnabled}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isEnabled: checked as boolean })
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