import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product} from '@/types/product';
import { Category } from '@/types/category'; // 1. Importe o Tipo Category
import { Check, X, Package, Tag, Calendar, Ruler } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  categories: Category[]; // 2. Adicione esta prop para receber a lista de dados
  open: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, categories, open, onClose }: ProductDetailModalProps) => {
  if (!product) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateFinalPrice = (list_price: number, discount: number) => {
    return list_price * (1 - discount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 3. Função para buscar o nome da categoria usando a lista que recebemos
  const getCategoryName = () => {
    // Tenta achar na lista de categorias pelo ID
    const foundCategory = categories.find(c => String(c.id) === String(product.categoryId));
    
    // Retorna o nome achado, ou o nome que veio no produto, ou "Desconhecida"
    return foundCategory?.name || product.categoryName || 'Categoria Desconhecida';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image and Basic Info */}
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-muted-foreground">{product.shortDescription}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={product.isEnabled ? 'default' : 'secondary'}>
                  {product.isEnabled ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                  {product.isEnabled ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant={product.inStock ? 'default' : 'destructive'}>
                  {product.inStock ? 'Em Estoque' : 'Esgotado'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Preços
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Preço de Lista</p>
                <p className="font-semibold">{formatCurrency(product.list_price)}</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Desconto</p>
                <p className="font-semibold">{product.discount}%</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Preço Final</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(calculateFinalPrice(product.list_price, product.discount))}
                </p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Custo</p>
                <p className="font-semibold">{formatCurrency(product.cost)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div>
            <h3 className="font-semibold mb-3">Descrição Completa</h3>
            <p className="text-muted-foreground">{product.fullDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Marca</p>
              <p className="font-medium">{product.brand}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">{getCategoryName()}</p>
            </div>
          </div>

          <Separator />

          {/* Dimension */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Dimensões
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="font-semibold">{product.dimension.weight} kg</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Largura</p>
                <p className="font-semibold">{product.dimension.width} cm</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Altura</p>
                <p className="font-semibold">{product.dimension.height} cm</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Comprimento</p>
                <p className="font-semibold">{product.dimension.length} cm</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          {product.details.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Detalhes Adicionais</h3>
                <div className="space-y-2">
                  {product.details.map((detail, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{detail.name}</span>
                      <span className="font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Dates */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Datas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-medium">{formatDate(product.creationTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atualizado em</p>
                <p className="font-medium">{formatDate(product.updateTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
