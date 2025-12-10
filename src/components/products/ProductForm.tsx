import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
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
import { Product, ProductFormData } from '@/types/product';
import { Category } from '@/types/category';
import { getAllCategories } from '@/services/categoryService';
import Categories from '@/pages/Categories';

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Função recursiva para transformar a Árvore em Lista Plana com indentação visual
const flattenCategoriesForSelect = (categories: Category[], level = 0): { id: string; name: string }[] => {
  let flatList: { id: string; name: string }[] = [];

  // Ordena alfabeticamente
  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  for (const cat of sorted) {
    // Adiciona o item atual com prefixo visual (ex: "— " para filhos)
    const prefix = level > 0 ? "— ".repeat(level) : "";

    flatList.push({
      id: cat.id.toString(), // Garante que seja string para o Select
      name: `${prefix}${cat.name}`
    });

    // Se tiver filhos, processa eles também (recursão)
    if (cat.children && cat.children.length > 0) {
      flatList = [...flatList, ...flattenCategoriesForSelect(cat.children, level + 1)];
    }
  }

  return flatList;
};

const ProductForm = ({
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  onSubmit,
  onCancel,
  isEditing,
}: ProductFormProps) => {

  const [categoriesOptions, setCategoriesOptions] = useState<{ id: string; name: string }[]>([]);

  // Busca categorias para o Select
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: any = await getAllCategories();
        let rawData: Category[] = [];
        if (response.content && Array.isArray(response.content)) {
          rawData = response.content;
        } else if (Array.isArray(response)) {
          rawData = response;
        }

        // Filtramos apenas as categorias que NÃO têm pai (Raízes).
        // A função flattenCategoriesForSelect vai encontrar os filhos através da propriedade .children
        const rootCategories = rawData.filter((cat) => !cat.parentId);
        
        // Passamos a lista filtrada para a recursão
        const flattened = flattenCategoriesForSelect(rootCategories);
        // ---------------------

        setCategoriesOptions(flattened);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


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
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Nome do produto"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Marca *</label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
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
              {/* Mapeia a lista processada (categoriesOptions) em vez de categories cru */}
              {categoriesOptions.map((cat, index) => (
                <SelectItem
                  key={`${cat.id}-${index}`}
                  value={cat.id}
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição Curta</label>
          <Input
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Descrição breve do produto"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição Completa</label>
          <Textarea
            id="fullDescription"
            name="fullDescription"
            value={formData.fullDescription}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      {/* Imagem do Produto */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
          Imagem do Produto
        </h4>

        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {selectedFile ? (
              <img 
                src={URL.createObjectURL(selectedFile)} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : isEditing && formData.imageUrl ? (
              <img 
                src={formData.imageUrl} 
                alt="Imagem atual" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground text-center px-2">Sem imagem</span>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
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
            {selectedFile ? (
              <p className="text-sm text-green-600 font-medium">
                Nova imagem: {selectedFile.name}
              </p>
            ) : isEditing && formData.imageUrl ? (
              <p className="text-xs text-muted-foreground">
                Envie outra imagem para substituir a atual
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, GIF
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
          Preços
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Preço *</label>
            <Input
              id="list_price"
              name="list_price"
              value={formData.list_price}
              onChange={handleChange}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Desconto (%)</label>
            <Input
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Custo</label>
            <Input
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
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
            <Input id="weight" name="weight" value={formData.weight} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Largura (cm)</label>
            <Input id="width" name="width" value={formData.width} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Altura (cm)</label>
            <Input id="height" name="height" value={formData.height} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Comprimento (cm)</label>
            <Input id="length" name="length" value={formData.length} onChange={handleChange} />
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
              onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked as boolean })}
            />
            <label htmlFor="isEnabled" className="text-sm font-medium text-foreground cursor-pointer">
              Ativo
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked as boolean })}
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
          {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ProductForm;
