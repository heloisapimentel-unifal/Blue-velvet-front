import { Package, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface StorefrontProductCardProps {
  product: Product;
  index: number;
  onViewMore: () => void;
}

const StorefrontProductCard = ({ product, index, onViewMore }: StorefrontProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const finalPrice = product.list_price * (1 - product.discount / 100);
  const hasDiscount = product.discount > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    
    addToCart(product);
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 flex flex-col h-full">
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            {!product.inStock && (
              <Badge 
                variant="secondary" 
                className="bg-muted/90 backdrop-blur-sm text-muted-foreground text-xs font-medium"
              >
                Indisponível
              </Badge>
            )}
          </div>
          {hasDiscount && (
            <Badge className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground text-xs font-bold px-2">
              -{product.discount}%
            </Badge>
          )}
        </div>

        {/* Image */}
        <div 
          className="aspect-square overflow-hidden bg-gradient-to-br from-secondary/30 to-secondary/60 cursor-pointer"
          onClick={onViewMore}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand */}
          <span className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">
            {product.brand}
          </span>

          {/* Name */}
          <h3 
            className="font-semibold text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors cursor-pointer leading-snug"
            onClick={onViewMore}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Price */}
          <div className="mb-3">
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

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onViewMore}
              variant="ghost"
              size="sm"
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Detalhes
            </Button>
            <Button
              onClick={handleAddToCart}
              size="sm"
              disabled={!product.inStock}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorefrontProductCard;
