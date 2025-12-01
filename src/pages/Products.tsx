import { useState } from 'react';
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
import { Product, ProductFormData, initialProducts, categories } from '@/types/product';
import ProductForm from '@/components/products/ProductForm';
import ProductTable from '@/components/products/ProductTable';

const emptyFormData: ProductFormData = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  brand: '',
  categoryId: '',
  listPrice: '',
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
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories.find(c => c.id === product.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      brand: product.brand,
      categoryId: product.categoryId.toString(),
      listPrice: product.listPrice.toString(),
      discount: product.discount.toString(),
      isEnabled: product.isEnabled,
      inStock: product.inStock,
      weight: product.dimensions.weight.toString(),
      width: product.dimensions.width.toString(),
      height: product.dimensions.height.toString(),
      length: product.dimensions.length.toString(),
      cost: product.cost.toString(),
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.listPrice || !formData.categoryId || !formData.brand) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date().toISOString();
    const categoryName = categories.find(c => c.id === parseInt(formData.categoryId))?.name;

    if (editingProduct) {
      setProducts(products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              shortDescription: formData.shortDescription,
              fullDescription: formData.fullDescription,
              brand: formData.brand,
              categoryId: parseInt(formData.categoryId),
              categoryName,
              listPrice: parseFloat(formData.listPrice),
              discount: parseFloat(formData.discount) || 0,
              isEnabled: formData.isEnabled,
              inStock: formData.inStock,
              updateTime: now,
              dimensions: {
                weight: parseFloat(formData.weight) || 0,
                width: parseFloat(formData.width) || 0,
                height: parseFloat(formData.height) || 0,
                length: parseFloat(formData.length) || 0,
              },
              cost: parseFloat(formData.cost) || 0,
            }
          : p
      ));
      toast({
        title: 'Produto atualizado',
        description: `"${formData.name}" foi atualizado com sucesso.`,
      });
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        brand: formData.brand,
        categoryId: parseInt(formData.categoryId),
        categoryName,
        listPrice: parseFloat(formData.listPrice),
        discount: parseFloat(formData.discount) || 0,
        isEnabled: formData.isEnabled,
        inStock: formData.inStock,
        creationTime: now,
        updateTime: now,
        dimensions: {
          weight: parseFloat(formData.weight) || 0,
          width: parseFloat(formData.width) || 0,
          height: parseFloat(formData.height) || 0,
          length: parseFloat(formData.length) || 0,
        },
        cost: parseFloat(formData.cost) || 0,
        details: [],
      };
      setProducts([...products, newProduct]);
      toast({
        title: 'Produto criado',
        description: `"${formData.name}" foi adicionado com sucesso.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (productToDelete) {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      toast({
        title: 'Produto excluído',
        description: `"${productToDelete.name}" foi removido.`,
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
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
          <ProductTable
            products={filteredProducts}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
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