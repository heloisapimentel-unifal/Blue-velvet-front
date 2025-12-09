import { useNavigate } from 'react-router-dom';
import { Music, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

const StorefrontHeader = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/store')}
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-foreground leading-tight">Blue Velvet</span>
              <span className="text-xs text-muted-foreground">Music Store</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/store/cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 flex items-center justify-center bg-accent text-accent-foreground text-xs font-semibold"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              )}
            </Button>

            {/* Login Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/store/login')}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StorefrontHeader;
