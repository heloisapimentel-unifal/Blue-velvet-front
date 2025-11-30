import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { Category } from '@/types/category'; // Importa o tipo Category
import { useMemo } from 'react'; // Usaremos useMemo

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

// Interface para as categorias hierárquicas a serem exibidas na tabela
interface HierarchicalCategory extends Category {
    level: number;
}

const CategoryTable = ({ categories, onEdit, onDelete }: CategoryTableProps) => {

  // Função para construir a lista hierárquica plana para exibição
  const getHierarchicalList = (categories: Category[]): HierarchicalCategory[] => {
    const hierarchicalList: HierarchicalCategory[] = [];
    const categoryMap = new Map<string | null, Category[]>();

    // 1. Criar mapa de pais e filhos
    categories.forEach(cat => {
      const parentId = cat.parentId;
      if (!categoryMap.has(parentId)) {
        categoryMap.set(parentId, []);
      }
      categoryMap.get(parentId)!.push(cat);
    });

    // 2. Função de travessia recursiva
    const traverse = (parentId: string | null, level: number) => {
      const children = categoryMap.get(parentId) || [];
      // Ordena alfabeticamente
      children.sort((a, b) => a.name.localeCompare(b.name)); 
      
      for (const cat of children) {
        hierarchicalList.push({ ...cat, level });
        traverse(cat.id, level + 1);
      }
    };

    // Inicia a travessia com as categorias principais (Top-level: parentId = null)
    traverse(null, 0);
    return hierarchicalList;
  };
  
  // Lista de categorias ordenada e indentada para a tabela
  const hierarchicalCategories = useMemo(() => 
    getHierarchicalList(categories)
  , [categories]);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nome da Categoria</TableHead>
            {/* REMOVIDO: Coluna Nome do Arquivo da Imagem */}
            <TableHead className="text-center w-[120px]">Status</TableHead>
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hierarchicalCategories.length === 0 ? (
            <TableRow>
              {/* Ajustado colSpan para 3 colunas (Nome, Status, Ações) */}
              <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                Nenhuma categoria encontrada.
              </TableCell>
            </TableRow>
          ) : (
            hierarchicalCategories.map((category) => (
              <TableRow key={category.id} className="group">
                <TableCell className="font-medium text-foreground">
                  {/* Indentação baseada no nível hierárquico */}
                  <div 
                    className="flex items-center gap-2" 
                    style={{ paddingLeft: `${category.level * 20}px` }} 
                  >
                     <Tag className={`w-4 h-4 ${category.level === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                     {category.level > 0 && <span className="text-muted-foreground mr-1">—</span>}
                     {category.name}
                  </div>
                </TableCell>
                
                {/* REMOVIDO: Célula Nome do Arquivo da Imagem */}
                
                <TableCell className="text-center">
                  <span 
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      category.isEnabled 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {category.isEnabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {category.isEnabled ? 'Ativa' : 'Inativa'}
                  </span>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(category)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;