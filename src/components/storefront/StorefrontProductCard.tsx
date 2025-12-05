import { Package } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StorefrontProductCardProps {
  product: Product;
  index: number;
  onViewMore: () => void;
}

const StorefrontProductCard = ({ product, index, onViewMore }: StorefrontProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const finalPrice = product.list_price * (1 - product.discount / 100);
  const hasDiscount = product.discount > 0;

  return (
    <div
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col h-full">
        {/* Discount Badge */}
        {hasDiscount && (
          <Badge className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground">
            -{product.discount}%
          </Badge>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 z-10 bg-muted text-muted-foreground"
          >
            Indisponível
          </Badge>
        )}

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-secondary/50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand */}
          <span className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
            {product.brand}
          </span>

          {/* Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.list_price)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-foreground">
                {formatPrice(product.list_price)}
              </span>
            )}
          </div>

          {/* View More Button */}
          <Button
            onClick={onViewMore}
            variant="outline"
            className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
          >
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StorefrontProductCard;
