import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ChevronRight, Home, Loader2 } from 'lucide-react'; // Adicionei Loader2
import { getCategoryImageUrl, Category } from '@/types/category';
import { getAllCategories } from '@/services/categoryService';
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

const ITEMS_PER_PAGE = 10;

const Storefront = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParentId, setSelectedParentId] = useState<string | number | null>(null);

  // Estado para os dados
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca de dados ao carregar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response: any = await getAllCategories();

        // Tratamento para paginação do Spring Boot (content) ou Array direto
        let data: Category[] = [];
        if (response.content && Array.isArray(response.content)) {
          data = response.content;
        } else if (Array.isArray(response)) {
          data = response;
        }

        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar vitrine:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Filtra apenas categorias habilitadas
  const enabledCategories = useMemo(() => {
    return categories.filter(cat => cat.enabled); // Certifique-se que o backend retorna 'enabled'
  }, [categories]);

  // Categoria atual para o breadcrumb
  const currentCategory = useMemo(() => {
    if (!selectedParentId) return null;
    return enabledCategories.find(cat => cat.id === selectedParentId);
  }, [selectedParentId, enabledCategories]);

  // Constrói o caminho do breadcrumb
  const breadcrumbPath = useMemo(() => {
    const path: Category[] = [];
    let current = currentCategory;

    // Proteção contra loop infinito e verificação de tipos
    let safetyCounter = 0;
    while (current && safetyCounter < 10) {
      path.unshift(current);
      // Busca o pai baseada no parentId
      current = enabledCategories.find(cat => cat.id === current?.parentId);
      safetyCounter++;
    }

    return path;
  }, [currentCategory, enabledCategories]);

  // Categorias para mostrar na tela (Filhas da selecionada ou Raiz)
  const displayedCategories = useMemo(() => {
    return enabledCategories
      .filter(cat => {
        // Se selectedParentId for null, pega quem não tem parentId (raiz)
        // Se tiver ID, pega quem tem esse ID como parentId
        if (selectedParentId === null) {
          return !cat.parentId;
        }
        return cat.parentId === selectedParentId;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [enabledCategories, selectedParentId]);

  // Lógica de Paginação
  const totalPages = Math.ceil(displayedCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = displayedCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryClick = (category: Category) => {
    // Verifica se a categoria tem filhas
    const hasChildren = enabledCategories.some(cat =>
      cat.parentId && String(cat.parentId) === String(category.id)
    );

    if (hasChildren) {
      // Se tem filhas, entra nela (navegação interna)
      setSelectedParentId(category.id);
      setCurrentPage(1);
    } else {
      // Se não tem filhas, vai para a página de produtos dessa categoria
      navigate(`/store/category/${category.id}`);
    }
  };

  const handleBreadcrumbClick = (categoryId: string | number | null) => {
    setSelectedParentId(categoryId);
    setCurrentPage(1);
  };

  // TELA DE CARREGAMENTO (Evita tela branca)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando loja...</p>
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
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => handleBreadcrumbClick(null)}
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
                    onClick={() => handleBreadcrumbClick(cat.id)}
                    className="cursor-pointer hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentCategory ? currentCategory.name : 'Categorias'}
          </h1>
          <p className="text-muted-foreground">
            {currentCategory
              ? `Explore as subcategorias de ${currentCategory.name}`
              : 'Explore nosso catálogo de instrumentos e acessórios musicais'}
          </p>
        </div>

        {/* Categories Grid */}
        {paginatedCategories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedCategories.map((category, index) => {
                const hasChildren = enabledCategories.some(cat =>
                  cat.parentId && String(cat.parentId) === String(category.id)
                );
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="group cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                      <div className="aspect-square overflow-hidden bg-secondary/50">
                        {/* Verifique se getCategoryImageUrl trata URL nula */}
                        <img
                          src={getCategoryImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            // Fallback caso a imagem quebre
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {hasChildren ? 'Ver subcategorias' : 'Ver produtos'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <Music className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {selectedParentId
                ? "Nenhuma subcategoria encontrada."
                : "Nenhuma categoria disponível na loja."}
            </p>
          </div>
        )}
      </main>

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