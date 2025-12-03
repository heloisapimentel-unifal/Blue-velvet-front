import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Home, ArrowLeft, Package } from 'lucide-react';
import { initialCategories, getCategoryImageUrl, Category } from '@/types/category';
import { initialProducts, Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import StorefrontProductCard from '@/components/storefront/StorefrontProductCard';
import StorefrontProductModal from '@/components/storefront/StorefrontProductModal';

const ITEMS_PER_PAGE = 12;

const StorefrontCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Get only enabled categories
  const enabledCategories = useMemo(() => {
    return initialCategories.filter(cat => cat.isEnabled);
  }, []);

  // Get current category
  const currentCategory = useMemo(() => {
    return enabledCategories.find(cat => cat.id === categoryId);
  }, [categoryId, enabledCategories]);

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: Category[] = [];
    let current = currentCategory;
    
    while (current) {
      path.unshift(current);
      current = enabledCategories.find(cat => cat.id === current?.parentId);
    }
    
    return path;
  }, [currentCategory, enabledCategories]);

  // Get enabled products for this category
  const categoryProducts = useMemo(() => {
    // For demo, we'll filter by category name matching
    // In a real app, this would use proper category ID matching
    return initialProducts
      .filter(product => product.isEnabled)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Pagination
  const totalPages = Math.ceil(categoryProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = categoryProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Categoria não encontrada</p>
          <Button onClick={() => navigate('/store')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-foreground leading-tight">Blue Velvet</span>
              <span className="text-xs text-muted-foreground">Music Store</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/store')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar às categorias
        </Button>

        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate('/store')}
                className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbPath.map((cat, index) => (
              <BreadcrumbItem key={cat.id}>
                <BreadcrumbSeparator />
                {index === breadcrumbPath.length - 1 ? (
                  <BreadcrumbPage>{cat.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    onClick={() => navigate('/store')}
                    className="cursor-pointer hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary/50">
              <img
                src={getCategoryImageUrl(currentCategory.imageFilename)}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {currentCategory.name}
              </h1>
              <p className="text-muted-foreground">
                {categoryProducts.length} produto{categoryProducts.length !== 1 ? 's' : ''} encontrado{categoryProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedProducts.map((product, index) => (
                <StorefrontProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onViewMore={() => setSelectedProduct(product)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto disponível nesta categoria</p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <StorefrontProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          © 2024 Blue Velvet Music Store. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default StorefrontCategory;
