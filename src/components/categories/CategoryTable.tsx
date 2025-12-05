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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { MoreHorizontal, Pencil, Trash2, Eye, Check, X, Tag, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Category, getCategoryImageUrl } from '@/types/category';
import CategoryDetailModal from './CategoryDetailModal';

const ITEMS_PER_PAGE = 10;

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
type SortField = 'name' | 'id';

const CategoryTable = ({
  categories,
  allCategories,
  onEdit,
  onDelete,
  highlightIds,
  searchTerm // Recebendo o termo de busca
}: CategoryTableProps) => {

  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');
  const [currentPage, setCurrentPage] = useState(1);

  // --- LÓGICA DE ORDENAÇÃO ---

  // Ciclo: Default -> Asc -> Desc -> Default
  const toggleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
    } else {
      setSortDirection(prev => {
        if (prev === 'default') return 'asc';
        if (prev === 'asc') return 'desc';
        return 'default';
      });
    }
    setCurrentPage(1);
  };

  const compareCategories = (a: Category, b: Category) => {
    if (sortField === 'id') {
      const comparison = Number(a.id) - Number(b.id);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    const comparison = a.name.localeCompare(b.name);
    return sortDirection === 'asc' ? comparison : -comparison;
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    if (sortDirection === 'asc') return <ChevronUp className="ml-2 h-4 w-4" />;
    if (sortDirection === 'desc') return <ChevronDown className="ml-2 h-4 w-4" />;
    return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  // --- LÓGICA DE HIERARQUIA ---

// Dentro de CategoryTable.tsx

  // --- NOVA LÓGICA DE HIERARQUIA ---
  
  // Essa função pega a árvore (que vem do backend) e transforma em uma lista linear
  // para a tabela conseguir desenhar, mas mantendo a propriedade 'level' para indentação.
  const flattenHierarchicalData = (nodes: Category[], level = 0): HierarchicalCategory[] => {
    let result: HierarchicalCategory[] = [];

    // Ordena alfabeticamente neste nível
    const sortedNodes = [...nodes].sort((a, b) => a.name.localeCompare(b.name));

    for (const node of sortedNodes) {
      // 1. Adiciona o pai atual
      result.push({ ...node, level });

      // 2. Se tiver filhos (children), processa eles recursivamente aumentando o nível
      if (node.children && node.children.length > 0) {
        const childrenFlat = flattenHierarchicalData(node.children, level + 1);
        result = [...result, ...childrenFlat];
      }
    }

    return result;
  };

  // --- LÓGICA DE EXIBIÇÃO ---
  const displayedCategories = useMemo(() => {
    const isSearching = searchTerm.trim().length > 0;
    const isSorting = sortDirection !== 'default';

    // FIX CRÍTICO: Primeiro, identificamos a árvore correta.
    const rootCategories = categories.filter(cat => !cat.parentId);
    
    // Gera a lista linear correta baseada APENAS nas raízes
    const hierarchicalList = flattenHierarchicalData(rootCategories);

    // 1. Se tiver busca
    if (isSearching) {
       return hierarchicalList.filter(cat => 
         cat.name.toLowerCase().includes(searchTerm.toLowerCase())
       ).map(c => ({...c, level: 0})); 
    }

    // 2. Se tiver ordenação forçada
    if (isSorting) {
       return hierarchicalList.map(c => ({...c, level: 0})).sort(compareCategories);
    }

    // 3. PADRÃO: Mostra a árvore processada
    return hierarchicalList;

  }, [categories, searchTerm, sortDirection, sortField]);

  // Paginação
  const totalPages = Math.ceil(displayedCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = displayedCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset página ao mudar busca
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {/* Coluna ID com Sort */}
            <TableHead className="w-[80px]">
              <Button
                variant="ghost"
                onClick={() => toggleSort('id')}
                className="-ml-3 h-8 hover:bg-muted/50"
              >
                <span>ID</span>
                {getSortIcon('id')}
              </Button>
            </TableHead>
            {/* Cabeçalho Clicável para Ordenação por Nome */}
            <TableHead className="w-[400px]">
              <Button
                variant="ghost"
                onClick={() => toggleSort('name')}
                className="-ml-3 h-8 hover:bg-muted/50"
              >
                <span>Categoria</span>
                {getSortIcon('name')}
              </Button>
            </TableHead>

            <TableHead className="text-center w-[120px]">Status</TableHead>
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                {searchTerm
                  ? `Nenhum resultado para "${searchTerm}"`
                  : 'Nenhuma categoria encontrada.'}
              </TableCell>
            </TableRow>
          ) : (
            paginatedCategories.map((category) => (
              <TableRow
                key={category.id}
                className={`group transition-colors ${highlightIds?.has(category.id.toString())
                    ? 'bg-primary/10 border-l-4 border-l-primary font-semibold'
                    : ''
                  }`}
              >
                {/* CÉLULA ID */}
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {category.id}
                </TableCell>

                {/* CÉLULA CATEGORIA (Imagem + Nome + Hierarquia/Flat) */}
                <TableCell className="font-medium text-foreground py-2">
                  <div
                    className="flex items-center gap-3"
                    style={{ paddingLeft: `${category.level * 20}px` }}
                  >
                    {/* Imagem */}
                    <img
                      src={getCategoryImageUrl(category.image)}
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
                      {category.level > 0 && <span className="text-muted-foreground mr-1">—</span>}
                      {category.name}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${category.enabled
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {category.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {category.enabled ? 'Ativa' : 'Inativa'}
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

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="border-t border-border p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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