import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Eye, Check, X, Tag, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Category, getCategoryImageUrl } from '@/types/category';
import CategoryDetailModal from './CategoryDetailModal';

interface CategoryTableProps {
  categories: Category[];
  allCategories: Category[]; // Mantido para o Modal
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  highlightIds?: Set<string>;
  searchTerm: string; // 👈 Nova prop recebida do Pai
}

// Interface para as categorias hierárquicas a serem exibidas na tabela
interface HierarchicalCategory extends Category {
    level: number;
}

// Tipo para os 3 estados de ordenação
type SortDirection = 'default' | 'asc' | 'desc';

const CategoryTable = ({ 
  categories, 
  allCategories, 
  onEdit, 
  onDelete, 
  highlightIds, 
  searchTerm // Recebendo o termo de busca
}: CategoryTableProps) => {
  
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');

  // --- LÓGICA DE ORDENAÇÃO ---

  // Ciclo: Default -> Asc -> Desc -> Default
  const toggleSort = () => {
    setSortDirection(prev => {
      if (prev === 'default') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'default';
    });
  };

  const compareCategories = (a: Category, b: Category) => {
    const comparison = a.name.localeCompare(b.name);
    return sortDirection === 'asc' ? comparison : -comparison;
  };

  const getSortIcon = () => {
    if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  // --- LÓGICA DE HIERARQUIA ---

  // Constrói a árvore (apenas para o estado 'default')
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
      // Ordena alfabeticamente os irmãos na árvore
      children.sort((a, b) => a.name.localeCompare(b.name)); 
      
      for (const cat of children) {
        hierarchicalList.push({ ...cat, level });
        traverse(cat.id, level + 1);
      }
    };

    // Inicia a travessia
    traverse(null, 0);
    return hierarchicalList;
  };
  
  // --- LÓGICA PRINCIPAL DE EXIBIÇÃO ---
  const displayedCategories = useMemo(() => {
    const isSearching = searchTerm.trim().length > 0;
    const isSorting = sortDirection !== 'default';

    // REGRA: Se NÃO tem busca E NÃO tem ordenação forçada -> Mostra Hierarquia (Árvore)
    if (!isSearching && !isSorting) {
      return getHierarchicalList(categories);
    }

    // CASO CONTRÁRIO -> Mostra Lista Plana (Flat List)
    
    // 1. Começa com todas ou filtra se tiver busca
    let flatList = categories;
    
    if (isSearching) {
      flatList = flatList.filter((cat) => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Remove indentação (level 0)
    let processedList = flatList.map((cat) => ({ ...cat, level: 0 }));

    // 3. Aplica a Ordenação
    if (isSorting) {
      processedList.sort(compareCategories);
    } else {
      // Se estiver buscando (mas sem sort), ordena A-Z por padrão
      processedList.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return processedList;

  }, [categories, searchTerm, sortDirection]);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {/* Cabeçalho Clicável para Ordenação */}
            <TableHead className="w-[400px]">
              <Button 
                variant="ghost" 
                onClick={toggleSort}
                className="-ml-3 h-8 hover:bg-muted/50"
              >
                <span>Categoria</span>
                {getSortIcon()}
              </Button>
            </TableHead>
            
            <TableHead className="text-center w-[120px]">Status</TableHead>
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                {searchTerm 
                  ? `Nenhum resultado para "${searchTerm}"` 
                  : 'Nenhuma categoria encontrada.'}
              </TableCell>
            </TableRow>
          ) : (
            displayedCategories.map((category) => (
              <TableRow 
                key={category.id} 
                className={`group transition-colors ${
                  highlightIds?.has(category.id)
                    ? 'bg-primary/10 border-l-4 border-l-primary font-semibold' 
                    : ''
                }`}
              >
                
                {/* CÉLULA CATEGORIA (Imagem + Nome + Hierarquia/Flat) */}
                <TableCell className="font-medium text-foreground py-2">
                  <div 
                    className="flex items-center gap-3" 
                    // Se for Flat (level 0), padding é 0. Se for Árvore, tem padding.
                    style={{ paddingLeft: `${category.level * 20}px` }} 
                  >
                    {/* Imagem */}
                    <img 
                        src={getCategoryImageUrl(category.imageFilename)}
                        alt={`Imagem de ${category.name}`}
                        className="w-10 h-10 object-cover rounded-md border border-border flex-shrink-0"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.png'; 
                            target.onerror = null;
                        }}
                    />
                    
                    {/* Texto com Ícone e Nome */}
                    <div className="flex items-center">
                        <Tag className={`w-4 h-4 mr-2 ${category.level === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        {/* Traço hierárquico só aparece se level > 0 */}
                        {category.level > 0 && <span className="text-muted-foreground mr-1">—</span>}
                        {category.name}
                    </div>
                  </div>
                </TableCell>
                
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => setViewCategory(category)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(category)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <CategoryDetailModal
        category={viewCategory}
        allCategories={allCategories}
        open={!!viewCategory}
        onClose={() => setViewCategory(null)}
      />
    </div>
  );
};

export default CategoryTable;