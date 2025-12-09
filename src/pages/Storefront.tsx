import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { getCategoryImageUrl, Category } from '@/types/category';
import { Product } from '@/types/product';
import { getAllCategories } from '@/services/categoryService';
import { getAllProducts } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/ui/loadingScreen';
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
import StorefrontHeader from '@/components/storefront/StorefrontHeader';

const ITEMS_PER_PAGE = 12;

const Storefront = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Estado para os dados
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca de dados ao carregar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catsResponse, prodsResponse] = await Promise.all([
          getAllCategories(),
          getAllProducts()
        ]);

        // Tratamento para paginação do Spring Boot (content) ou Array direto
        let catsData: Category[] = [];
        const catsResAny = catsResponse as any;
        if (catsResAny.content && Array.isArray(catsResAny.content)) {
          catsData = catsResAny.content;
        } else if (Array.isArray(catsResponse)) {
          catsData = catsResponse;
        }

        let prodsData: Product[] = [];
        const prodsResAny = prodsResponse as any;
        if (prodsResAny.content && Array.isArray(prodsResAny.content)) {
          prodsData = prodsResAny.content;
        } else if (Array.isArray(prodsResponse)) {
          prodsData = prodsResponse;
        }

        setCategories(catsData);
        setAllProducts(prodsData);
      } catch (error) {
        console.error("Erro ao carregar vitrine:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filtra apenas categorias habilitadas
  const enabledCategories = useMemo(() => {
    return categories.filter(cat => cat.enabled);
  }, [categories]);

  // Apenas categorias pai (sem parentId)
  const parentCategories = useMemo(() => {
    return enabledCategories
      .filter(cat => !cat.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [enabledCategories]);

  // Todos os produtos habilitados
  const enabledProducts = useMemo(() => {
    return allProducts
      .filter(product => product.isEnabled)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  // Paginação dos produtos
  const totalPages = Math.ceil(enabledProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = enabledProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryClick = (category: Category) => {
    navigate(`/store/category/${category.id}`);
  };

  // TELA DE CARREGAMENTO
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <StorefrontHeader />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 flex-1">
        {/* Categorias Pai - Blocos menores */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Categorias</h2>
          {parentCategories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {parentCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
                      <img
                        src={getCategoryImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/category-placeholder.png';
                        }}
                      />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                      {category.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma categoria disponível.</p>
          )}
        </section>

        {/* Todos os Produtos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Todos os Produtos</h2>
            <span className="text-sm text-muted-foreground">
              {enabledProducts.length} produto{enabledProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

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
              <p className="text-muted-foreground">Nenhum produto disponível na loja.</p>
            </div>
          )}
        </section>
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
          Projeto Blue Velvet Music Store. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Storefront;