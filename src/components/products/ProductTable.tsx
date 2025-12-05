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
import { MoreHorizontal, Pencil, Trash2, Eye, Check, X, Package } from 'lucide-react';
import { Product} from '@/types/product';
import ProductDetailModal from './ProductDetailModal';
import { Category } from '@/types/category';

const ITEMS_PER_PAGE = 10;

interface ProductTableProps {
  products: Product[];
  categories: Category[]; // 2. Adicionar categories nas props
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// Esta função percorre toda a árvore e cria um "Dicionário" simples: { "id": "Nome" }
// Isso resolve o problema de encontrar subcategorias, não importa onde elas estejam.
const createCategoryMap = (categories: Category[]): Record<string, string> => {
  const map: Record<string, string> = {};

  const traverse = (nodes: Category[]) => {
    for (const node of nodes) {
      // Grava o ID e o Nome no mapa
      map[String(node.id)] = node.name;
      
      // Se tiver filhos, mergulha neles (recursão)
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(categories);
  return map;
};

const findCategoryInTree = (categories: Category[], id: string | number): Category | undefined => {
  for (const cat of categories) {
    // Verifica se é a categoria atual
    if (String(cat.id) === String(id)) {
      return cat;
    }
    
    // Se tiver filhos, mergulha neles (recursão)
    if (cat.children && cat.children.length > 0) {
      const foundInChildren = findCategoryInTree(cat.children, id);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return undefined;
};

const ProductTable = ({ products, categories, onEdit, onDelete }: ProductTableProps) => {
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const categoryMap = useMemo(() => createCategoryMap(categories), [categories]);

  // Paginação
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset página quando produtos mudam (ex: busca)
  useMemo(() => {
    setCurrentPage(1);
  }, [products.length]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateFinalPrice = (listPrice?: number, discount?: number) => {
    if (!listPrice || isNaN(listPrice)) return 0;
    if (!discount || isNaN(discount)) return listPrice;
    return listPrice * (1 - discount / 100);
};

// Agora a busca é instantânea e funciona para subcategorias
  const getCategoryName = (categoryId: number | string) => {
    return categoryMap[String(categoryId)] || 'N/A';
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Produto</TableHead>
            <TableHead className="hidden lg:table-cell">Marca</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-center hidden sm:table-cell">Status</TableHead>
            <TableHead className="text-right w-[60px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            paginatedProducts.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground hidden sm:block">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {product.brand}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {getCategoryName(product.categoryId)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <p className="font-medium">
                      {formatCurrency(calculateFinalPrice(product.list_price, product.discount))}
                    </p>
                    {product.discount > 0 && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.list_price)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex justify-center gap-2">
                    <span 
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.isEnabled 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {product.isEnabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {product.isEnabled ? 'Ativo' : 'Inativo'}
                    </span>
                    <span 
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-500/10 text-green-600' 
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {product.inStock ? 'Em Estoque' : 'Esgotado'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => setViewProduct(product)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(product)}
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

      <ProductDetailModal
        product={viewProduct}
        categories={categories}
        open={!!viewProduct}
        onClose={() => setViewProduct(null)}
      />
    </div>
  );
};

export default ProductTable;
