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
import { Textarea } from '@/components/ui/textarea';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { Product, ProductFormData, categories } from '@/types/product';

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ProductForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }: ProductFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
          Informações Básicas
        </h4>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nome *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do produto"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Marca *</label>
          <Input
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="Marca do produto"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Categoria *</label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição Curta</label>
          <Input
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            placeholder="Descrição breve do produto"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição Completa</label>
          <Textarea
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            placeholder="Descrição detalhada do produto"
            rows={3}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
          Preços
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Preço *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.listPrice}
              onChange={(e) => setFormData({ ...formData, listPrice: e.target.value })}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Desconto (%)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Custo</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
          Dimensões
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Peso (kg)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Largura (cm)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Altura (cm)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Comprimento (cm)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value })}
              placeholder="0"
            />
          </div>
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
              Ativo
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, inStock: checked as boolean })
              }
            />
            <label htmlFor="inStock" className="text-sm font-medium text-foreground cursor-pointer">
              Em Estoque
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

export default ProductForm;
