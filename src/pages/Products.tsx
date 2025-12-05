import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LogOut,
  Plus,
  Search,
  ArrowLeft,
  Tag,
  Music,
  Disc3,
  Guitar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductFormData } from '@/types/product';
import { Category } from '@/types/category';
// Importamos os serviços
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/services/productService';
import { getAllCategories } from '@/services/categoryService'; // Serviço de categorias
import ProductForm from '@/components/products/ProductForm';
import ProductTable from '@/components/products/ProductTable';

const emptyFormData: ProductFormData = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  brand: '',
  categoryId: '',
  list_price: '',
  discount: '0',
  isEnabled: true,
  inStock: true,
  weight: '',
  width: '',
  height: '',
  length: '',
  cost: '',
};

const Products = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. Mudança: Inicia vazio, pois os dados virão do backend
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 2. Novo estado para controlar o loading
  const [isLoading, setIsLoading] = useState(true);

  // Estados existentes...
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  // 3. Novo: UseEffect para buscar os dados ao carregar a página
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 1. Buscamos Produtos e Categorias em paralelo (apenas uma vez)
      const [productsData, categoriesResponse] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);

      // 2. Tratamento robusto para extrair a lista de categorias (Paginação ou Array)
      let categoriesList: Category[] = [];
      const catsResAny = categoriesResponse as any;

      if (catsResAny.content && Array.isArray(catsResAny.content)) {
        // Se vier paginado (Spring Page)
        categoriesList = catsResAny.content;
      } else if (Array.isArray(categoriesResponse)) {
        // Se vier lista simples
        categoriesList = categoriesResponse;
      }

      // 3. Atualizamos o estado das categorias para usar no resto da tela
      setCategories(categoriesList);

      // 4. Cruzamos os dados usando a lista LOCAL 'categoriesList'
      // IMPORTANTE: Usamos 'categoriesList' e não o estado 'categories' 
      // porque o estado só atualiza no próximo render.
      const productsWithCategory = productsData.map((p) => ({
        ...p,
        // Converte IDs para String para garantir a comparação (100 === "100")
        categoryName: p.categoryName || categoriesList.find(c => String(c.id) === String(p.categoryId))?.name
      }));

      // 5. Salvamos os produtos já com os nomes
      setProducts(productsWithCategory);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível carregar os dados do servidor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Lógica de filtro corrigida para usar o estado 'categories' real
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Busca o nome da categoria na lista carregada do backend
      categories.find(c => String(c.id) === String(product.categoryId))?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      brand: product.brand,
      categoryId: String(product.categoryId), // Garante string para o select
      list_price: String(product.list_price),  // Atenção ao camelCase listPrice
      discount: product.discount.toString(),
      isEnabled: product.isEnabled,
      inStock: product.inStock,
      weight: product.dimension.weight.toString(),
      width: product.dimension.width.toString(),
      height: product.dimension.height.toString(),
      length: product.dimension.length.toString(),
      cost: product.cost.toString(),
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.list_price || !formData.categoryId || !formData.brand) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    const selectedCategoryId = parseInt(formData.categoryId); // Garante que seja número
    const categoryName = categories.find(c => String(c.id) === String(formData.categoryId))?.name;

    try {
      setIsLoading(true); // Opcional: mostrar loading durante o salvamento


      const payload = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        brand: formData.brand,
        categoryId: selectedCategoryId, // Envia o ID numérico        
        // Conversão de moeda (R$ 1.000,00 -> 1000.00)
        list_price: parseFloat(formData.list_price.replace(/\./g, '').replace(',', '.')),
        discount: parseFloat(formData.discount.replace(',', '.')) || 0,
        cost: parseFloat(formData.cost.replace(/\./g, '').replace(',', '.')) || 0,
        isEnabled: formData.isEnabled,
        inStock: formData.inStock,

        // Objeto embutido ProductDimension
        dimension: {
          weight: parseFloat(formData.weight.replace(',', '.')) || 0,
          width: parseFloat(formData.width.replace(',', '.')) || 0,
          height: parseFloat(formData.height.replace(',', '.')) || 0,
          length: parseFloat(formData.length.replace(',', '.')) || 0,
        }
      };

      if (editingProduct) {
        // UPDATE
        const updatedProduct = await updateProduct(editingProduct.id, payload, selectedFile);

        setProducts(products.map((p) =>
          p.id === editingProduct.id
            ? { 
                ...updatedProduct, 
                categoryId: selectedCategoryId, // Força a atualização do ID localmente
                categoryName: categoryName      // Atualiza o nome para exibição na tabela
              }
            : p
        ));
        toast({
          title: 'Produto atualizado',
          description: `"${payload.name}" foi atualizado com sucesso.`,
        });
      } else {
        // CREATE
        const newProduct = await createProduct(payload, selectedFile);

        setProducts([
          ...products, 
          { 
            ...newProduct, 
            categoryId: selectedCategoryId, // Força o ID no novo objeto
            categoryName: categoryName      // Adiciona o nome
          }
        ]);
      }

      // Fecha o modal e limpa o form
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(emptyFormData);
      setSelectedFile(null)

    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setProducts(products.filter((p) => p.id !== productToDelete.id));
        toast({
          title: 'Produto excluído',
          description: `"${productToDelete.name}" foi removido.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Erro ao excluir',
          description: 'Falha ao remover produto.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="p-2 rounded-lg bg-primary/10">
              <Guitar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">Catálogo de Produtos</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-muted-foreground">
              {user.name}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 animate-fade-in">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/categories">
                <Tag className="w-4 h-4 mr-2" />
                Categorias
              </Link>
            </Button>
            {/* Botão de Novo Produto */}
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>

        </div>

        {/* Products Table */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando produtos...</span>
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              categories={categories}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span>{filteredProducts.length} produto(s)</span>
          <span>Ativos: {filteredProducts.filter(p => p.isEnabled).length}</span>
          <span>Em estoque: {filteredProducts.filter(p => p.inStock).length}</span>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isEditing={!!editingProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Tem certeza que deseja excluir "{productToDelete?.name}"? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;