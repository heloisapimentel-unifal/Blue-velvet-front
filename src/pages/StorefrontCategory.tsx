import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Home, ArrowLeft, Package, ChevronRight } from 'lucide-react';
import { getCategoryImageUrl, Category } from '@/types/category';
import { Product } from '@/types/product';
import { getAllCategories } from '@/services/categoryService';
import { getAllProducts } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estados para armazenar dados
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca inicial de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [catsResponse, prodsResponse] = await Promise.all([
          getAllCategories(),
          getAllProducts()
        ]);

        // Tratamento de Paginação para Categorias
        let catsData: Category[] = [];
        const catsResAny = catsResponse as any;
        if (catsResAny.content && Array.isArray(catsResAny.content)) {
          catsData = catsResAny.content;
        } else if (Array.isArray(catsResponse)) {
          catsData = catsResponse;
        }

        // Tratamento de Paginação para Produtos
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
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar a categoria.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Reset página ao mudar de categoria
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  // Filtra apenas categorias ativas
  const enabledCategories = useMemo(() => {
    return categories.filter(cat => cat.enabled);
  }, [categories]);

  // Encontra a categoria atual baseada na URL
  const currentCategory = useMemo(() => {
    return enabledCategories.find(cat => String(cat.id) === categoryId);
  }, [categoryId, enabledCategories]);

  // Subcategorias da categoria atual (filhas diretas)
  const childCategories = useMemo(() => {
    if (!currentCategory) return [];
    return enabledCategories
      .filter(cat => String(cat.parentId) === String(currentCategory.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentCategory, enabledCategories]);

  // Constrói o Breadcrumb recursivamente
  const breadcrumbPath = useMemo(() => {
    const path: Category[] = [];
    let current = currentCategory;
    
    let depth = 0;
    while (current && depth < 10) {
      path.unshift(current);
      current = enabledCategories.find(cat => cat.id === current?.parentId);
      depth++;
    }
    
    return path;
  }, [currentCategory, enabledCategories]);

  // Coleta todos os IDs de categorias (atual + todas as subcategorias recursivamente)
  const getAllDescendantIds = (catId: string | number): (string | number)[] => {
    const ids: (string | number)[] = [catId];
    const children = enabledCategories.filter(cat => String(cat.parentId) === String(catId));
    children.forEach(child => {
      ids.push(...getAllDescendantIds(child.id));
    });
    return ids;
  };

  // Filtra os produtos desta categoria E de todas as subcategorias
  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];

    const allCategoryIds = getAllDescendantIds(currentCategory.id);
    
    return allProducts
      .filter(product => 
        allCategoryIds.some(id => String(product.categoryId) === String(id)) &&
        product.isEnabled
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts, currentCategory, enabledCategories]);

  // Paginação
  const totalPages = Math.ceil(categoryProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = categoryProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleChildCategoryClick = (category: Category) => {
    navigate(`/store/category/${category.id}`);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  // Not Found State
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
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
      <main className="container mx-auto px-6 py-8 flex-1">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/store')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à loja
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
                    onClick={() => navigate(`/store/category/${cat.id}`)}
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
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/50">
              <img
                src={getCategoryImageUrl(currentCategory.image)}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {currentCategory.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {categoryProducts.length} produto{categoryProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Subcategorias em linha */}
        {childCategories.length > 0 && (
          <section className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Subcategorias</h3>
            <div className="flex flex-wrap gap-2">
              {childCategories.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleChildCategoryClick(child)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                    <div className="w-6 h-6 rounded overflow-hidden bg-secondary/50 flex-shrink-0">
                      <img
                        src={getCategoryImageUrl(child.image)}
                        alt={child.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/category-placeholder.png';
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                      {child.name}
                    </span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Produtos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Produtos</h3>
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
              <p className="text-muted-foreground">Nenhum produto disponível nesta categoria</p>
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

export default StorefrontCategory;