import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';

const StorefrontCart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getItemPrice = (listPrice: number, discount: number) => {
    return listPrice * (1 - discount / 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/store')}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuar comprando
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Meu Carrinho
        </h1>

        {items.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Seu carrinho está vazio
                </h2>
                <p className="text-muted-foreground">
                  Adicione produtos para continuar suas compras
                </p>
              </div>
              <Button onClick={() => navigate('/store')} className="mt-4">
                Explorar produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const finalPrice = getItemPrice(item.product.list_price, item.product.discount);
                const hasDiscount = item.product.discount > 0;

                return (
                  <Card key={item.product.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:justify-between gap-2">
                            <div className="space-y-1">
                              {item.product.brand && (
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                  {item.product.brand}
                                </span>
                              )}
                              <h3 className="font-semibold text-foreground line-clamp-2">
                                {item.product.name}
                              </h3>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              {hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through block">
                                  {formatPrice(item.product.list_price)}
                                </span>
                              )}
                              <span className="text-lg font-bold text-foreground">
                                {formatPrice(finalPrice)}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-10 text-center font-medium text-foreground">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </Button>
                          </div>

                          {/* Subtotal */}
                          <div className="mt-2 text-right">
                            <span className="text-sm text-muted-foreground">
                              Subtotal: 
                            </span>
                            <span className="ml-1 font-semibold text-foreground">
                              {formatPrice(finalPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Clear Cart */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={clearCart}
                >
                  Limpar carrinho
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} itens)
                    </span>
                    <span className="text-foreground font-medium">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-muted-foreground">A calcular</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button className="w-full" size="lg">
                    Finalizar Compra
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/store')}
                  >
                    Continuar Comprando
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StorefrontCart;
