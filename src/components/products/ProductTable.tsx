import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Product, categories } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateFinalPrice = (listPrice: number, discount: number) => {
    return listPrice * (1 - discount / 100);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
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
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      {product.shortDescription}
                    </p>
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
                      {formatCurrency(calculateFinalPrice(product.listPrice, product.discount))}
                    </p>
                    {product.discount > 0 && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.listPrice)}
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
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product)}
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

export default ProductTable;
