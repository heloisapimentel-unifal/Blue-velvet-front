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
  Tag, // NOVO ÍCONE: Representa a categoria
  List, // Ícone para o botão "Produtos"
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Category, 
  CategoryFormData, 
  initialCategories 
} from '@/types/category'; // Importando types e dados de Categoria

import CategoryForm from '@/components/categories/CategoryForm'; // NOVO COMPONENTE
import CategoryTable from '@/components/categories/CategoryTable'; // NOVO COMPONENTE

// Form Data inicial para nova categoria
const emptyCategoryFormData: CategoryFormData = {
  name: '',
  imageFilename: '',
  parentId: null,
  isEnabled: true,
};

const Categories = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyCategoryFormData);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 🔴 VERIFICAÇÃO DE PERMISSÃO (Adaptar 'Administrator' ao seu sistema)
  // if (!user || user.role !== 'Administrator') {
  //   navigate('/dashboard'); 
  //   toast({
  //     title: 'Acesso Negado',
  //     description: 'Você não tem permissão para gerenciar categorias.',
  //     variant: 'destructive',
  //   });
  //   return null;
  // }
  if (!user) {
    navigate('/login');
    return null;
  }


  const filteredCategories = categoriesList.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.imageFilename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData(emptyCategoryFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      imageFilename: category.imageFilename,
      parentId: category.parentId,
      isEnabled: category.isEnabled,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.imageFilename) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date().toISOString();
    // Encontra o nome da categoria pai para armazenamento (evita lookup na renderização)
    const parentCategory = categoriesList.find(c => c.id === formData.parentId);
    const parentName = parentCategory ? parentCategory.name : undefined;


    if (editingCategory) {
      setCategoriesList(categoriesList.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: formData.name,
              imageFilename: formData.imageFilename,
              parentId: formData.parentId,
              parentName: parentName,
              isEnabled: formData.isEnabled,
              updateTime: now,
            }
          : c
      ));
      toast({
        title: 'Categoria atualizada',
        description: `"${formData.name}" foi atualizada com sucesso.`,
      });
    } else {
      const newCategory: Category = {
        id: Date.now().toString(), // ID simples baseado no timestamp
        name: formData.name,
        imageFilename: formData.imageFilename,
        parentId: formData.parentId,
        parentName: parentName,
        isEnabled: formData.isEnabled,
        creationTime: now,
      };
      setCategoriesList([...categoriesList, newCategory]);
      toast({
        title: 'Categoria criada',
        description: `"${formData.name}" foi adicionada com sucesso.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      // Verifica se a categoria possui subcategorias
      const hasChildren = categoriesList.some(c => c.parentId === categoryToDelete.id);

      if (hasChildren) {
         toast({
          title: 'Erro de Exclusão',
          description: `A categoria "${categoryToDelete.name}" possui subcategorias. Remova-as primeiro.`,
          variant: 'destructive',
        });
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // Implementação ideal: Verificar se há produtos associados antes de excluir.
      
      setCategoriesList(categoriesList.filter((c) => c.id !== categoryToDelete.id));
      toast({
        title: 'Categoria excluída',
        description: `"${categoryToDelete.name}" foi removida.`,
      });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
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
              <Tag className="w-6 h-6 text-primary" /> {/* Ícone Tag */}
            </div>
            <span className="text-xl font-semibold text-foreground">Gerenciamento de Categorias</span>
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
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Botões de Ação Agrupados */}
          <div className="flex gap-3">
            {/* Botão de Produtos */}
            <Button variant="outline" asChild>
                <Link to="/products">
                    <List className="w-4 h-4 mr-2" />
                    Produtos
                </Link>
            </Button>
            {/* Botão de Nova Categoria */}
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CategoryTable
            categories={filteredCategories}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span>{filteredCategories.length} categoria(s)</span>
          <span>Ativas: {filteredCategories.filter(c => c.isEnabled).length}</span>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isEditing={!!editingCategory}
            allCategories={categoriesList}
            currentCategoryId={editingCategory?.id}
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
            Tem certeza que deseja excluir "{categoryToDelete?.name}"? Esta ação não pode ser desfeita.
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

export default Categories;