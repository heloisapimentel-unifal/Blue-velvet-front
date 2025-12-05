import { Package, X, Check, AlertCircle, Ruler } from 'lucide-react';
import { Product } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface StorefrontProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const StorefrontProductModal = ({ product, open, onClose }: StorefrontProductModalProps) => {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const finalPrice = product.list_price * (1 - product.discount / 100);
  const hasDiscount = product.discount > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square bg-secondary/50 md:rounded-l-lg overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <Badge className="bg-destructive text-destructive-foreground text-sm px-3 py-1">
                  -{product.discount}% OFF
                </Badge>
              )}
              {product.inStock ? (
                <Badge className="bg-green-500/90 text-white">
                  <Check className="w-3 h-3 mr-1" />
                  Em Estoque
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted/90 text-muted-foreground">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Indisponível
                </Badge>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left mb-4">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {product.brand}
              </span>
              <DialogTitle className="text-2xl font-bold text-foreground mt-1">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Short Description */}
            <p className="text-muted-foreground mb-4">
              {product.shortDescription}
            </p>

            {/* Price Section */}
            <div className="mb-6">
              {hasDiscount ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.list_price)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.list_price)}
                </span>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Full Description */}
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-2">Descrição</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.fullDescription}
              </p>
            </div>

            {/* Dimensions */}
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Dimensões
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <span className="text-xs text-muted-foreground">Peso</span>
                  <p className="font-medium text-foreground">{product.dimension.weight} kg</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <span className="text-xs text-muted-foreground">Largura</span>
                  <p className="font-medium text-foreground">{product.dimension.width} cm</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <span className="text-xs text-muted-foreground">Altura</span>
                  <p className="font-medium text-foreground">{product.dimension.height} cm</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <span className="text-xs text-muted-foreground">Comprimento</span>
                  <p className="font-medium text-foreground">{product.dimension.length} cm</p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {product.details && product.details.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">Especificações</h4>
                <div className="space-y-2">
                  {product.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{detail.name}</span>
                      <span className="font-medium text-foreground">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StorefrontProductModal;
