import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Home, ArrowLeft, Package } from 'lucide-react';
import { getCategoryImageUrl, Category } from '@/types/category';
import { Product } from '@/types/product';
import { getAllCategories } from '@/services/categoryService';
import { getAllProducts } from '@/services/productService'; // Certifique-se de ter exportado isso
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
  
  // 1. Estados para armazenar dados reais
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Busca inicial de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Busca categorias e produtos em paralelo
        const [catsResponse, prodsResponse] = await Promise.all([
            getAllCategories(),
            getAllProducts()
        ]);

        console.log("DEBUG - Categorias vindas do Backend:", catsResponse);
        console.log("DEBUG - Produtos vindos do Backend:", prodsResponse);

        // Tratamento de Paginação para Categorias
        let catsData: Category[] = [];
        const catsResAny = catsResponse as any;
        if (catsResAny.content && Array.isArray(catsResAny.content)) {
            catsData = catsResAny.content;
        } else if (Array.isArray(catsResponse)) {
            catsData = catsResponse;
        }

        // Tratamento de Paginação para Produtos (caso seu backend pagine produtos também)
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

  // 3. Filtra apenas categorias ativas
  const enabledCategories = useMemo(() => {
    // Nota: Verifique se no seu tipo Category é 'enabled' ou 'isEnabled'
    return categories.filter(cat => cat.enabled); 
  }, [categories]);

  // 4. Encontra a categoria atual baseada na URL
  const currentCategory = useMemo(() => {
    // Compara convertendo para string, pois categoryId da URL é string
    return enabledCategories.find(cat => String(cat.id) === categoryId);
  }, [categoryId, enabledCategories]);

  // 5. Constrói o Breadcrumb recursivamente
  const breadcrumbPath = useMemo(() => {
    const path: Category[] = [];
    let current = currentCategory;
    
    // Proteção contra loops infinitos (max 10 níveis)
    let depth = 0;
    while (current && depth < 10) {
      path.unshift(current);
      current = enabledCategories.find(cat => cat.id === current?.parentId);
      depth++;
    }
    
    return path;
  }, [currentCategory, enabledCategories]);

  // 6. Filtra os produtos desta categoria
  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];

    return allProducts
      .filter(product => 
        // Filtra pelo ID da categoria (convertendo para string para garantir)
        String(product.categoryId) === String(currentCategory.id) && 
        product.isEnabled // Verifica se o produto está ativo
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts, currentCategory]);

  // Pagination Logic
  const totalPages = Math.ceil(categoryProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = categoryProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                    // Se for pai, poderíamos navegar para ele. Por enquanto volta pra store ou implementamos lógica de navegação
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
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary/50">
              <img
                src={getCategoryImageUrl(currentCategory.image)}
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
