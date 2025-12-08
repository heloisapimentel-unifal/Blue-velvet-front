import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingScreen from '@/components/ui/loadingScreen';
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
  Guitar,
  Download,
  RotateCcw, // Ícone
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { 
  Category, 
  CategoryFormData
} from '@/types/category'; 

import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  resetDatabase // RESSETANDO O BD 
} from '@/services/categoryService';

import CategoryForm from '@/components/categories/CategoryForm'; 
import CategoryTable from '@/components/categories/CategoryTable'; 

const emptyCategoryFormData: CategoryFormData = {
  name: '',
  existingImageUrl: '',
  parentId: null,
  enabled: true,
};

const Categories = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyCategoryFormData);

  useEffect(() => {
    fetchData();
  }, []);

 // --- FUNÇÃO DE RESET IMPLEMENTADA ---
  const handleReset = async () => {
     // 1. Confirmação de segurança (imprescindível)
     const confirm = window.confirm(
       "⚠️ PERIGO: Tem certeza? \n\nIsso apagará TODOS os produtos e categorias atuais e restaurará os dados iniciais do sistema. \n\nEssa ação não pode ser desfeita."
     );

     if (!confirm) return;

     try {
       setIsLoading(true);
       
       // 2. Chama o serviço
       await resetDatabase();

       // 3. Feedback de sucesso
       toast({
         title: "Sistema Resetado",
         description: "O banco de dados voltou ao estado original.",
         className: "bg-green-600 text-white" // Opcional: deixar verdinho
       });

       // 4. Recarrega a tabela para mostrar os dados novos
       await fetchData();

     } catch (error: any) {
       console.error(error);
       toast({
         title: "Erro ao resetar",
         description: error.message || "Não foi possível resetar o banco.",
         variant: "destructive"
       });
     } finally {
       setIsLoading(false);
     }
  };


  // ------------------------------------------------

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response: any = await getAllCategories(); 
      
      let data: Category[] = [];

      if (response.content && Array.isArray(response.content)) {
        data = response.content;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        console.warn("Formato inesperado:", response);
        data = [];
      }
      
      setCategoriesList(data);

    } catch (error) {
      console.error("Erro no fetch:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive"
      });
      setCategoriesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportCSV = () => {
    if (!categoriesList || categoriesList.length === 0) {
      toast({
        title: 'Nenhum dado',
        description: 'Não há categorias para exportar.',
        variant: 'destructive',
      });
      return;
    }

    const processHierarchy = (categories: Category[], level = 0): Array<{ id: string | number; name: string }> => {
      const result: Array<{ id: string | number; name: string }> = [];
      const roots = categories.filter(c => !c.parentId);
      
      const processNode = (cat: Category, depth: number) => {
        const indent = '  '.repeat(depth);
        result.push({ id: cat.id, name: `${indent}${cat.name}` });
        
        const children = categories.filter(c => String(c.parentId) === String(cat.id));
        children.sort((a, b) => a.name.localeCompare(b.name));
        children.forEach(child => processNode(child, depth + 1));
      };
      
      roots.sort((a, b) => a.name.localeCompare(b.name));
      roots.forEach(root => processNode(root, 0));
      
      return result;
    };

    const hierarchicalData = processHierarchy(categoriesList);

    const headers = ['id', 'name'];
    
    const rows = hierarchicalData.map(item => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const fileName = `categories_${dateStr}_${timeStr}.csv`;

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'CSV exportado',
      description: `${hierarchicalData.length} categorias exportadas com sucesso.`,
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData(emptyCategoryFormData);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId,
      enabled: category.enabled,
      existingImageUrl: category.image,
      newImageFile: null,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name,
        parentId: formData.parentId,
        enabled: formData.enabled,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload, selectedFile);
        
        toast({
          title: 'Categoria atualizada',
          description: `"${formData.name}" foi atualizada com sucesso.`,
        });

      } else {
        await createCategory(payload, selectedFile);
        
        toast({
          title: 'Categoria criada',
          description: `"${formData.name}" foi adicionada com sucesso.`,
        });
      }

      setIsDialogOpen(false);
      setFormData(emptyCategoryFormData);
      setSelectedFile(null);
      
      await fetchData();

    } catch (error: any) {
      console.error(error);
      
      const errorMessage = error?.message?.toLowerCase() || '';
      const isDuplicateError = errorMessage.includes('duplicate') || 
                               errorMessage.includes('duplicat') ||
                               errorMessage.includes('já existe') ||
                               errorMessage.includes('already exists') ||
                               errorMessage.includes('unique constraint');
      
      toast({
        title: isDuplicateError ? 'Nome duplicado' : 'Erro ao salvar',
        description: isDuplicateError 
          ? `Já existe uma categoria com o nome "${formData.name}". Por favor, escolha outro nome.`
          : (error instanceof Error ? error.message : 'Falha na comunicação com o servidor.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
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
      
      try {
        setIsLoading(true);
        await deleteCategory(categoryToDelete.id);
        
        toast({
          title: 'Categoria excluída',
          description: `"${categoryToDelete.name}" foi removida.`,
        });
        
        await fetchData();
      } catch (error) {
        console.error(error);
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir a categoria.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  if (isLoading && categoriesList.length === 0) {
      return <LoadingScreen />;
  }

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
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">Categorias Musicais</span>
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
          
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            
            {/* Botão de Reset com função vazia */}
            <Button variant="outline" size="icon" onClick={handleReset} title="Resetar filtros">
                <RotateCcw className="w-4 h-4" />
            </Button>

            <Button variant="outline" onClick={handleExportCSV} title="Exportar CSV">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Exportar CSV</span>
            </Button>

            <Button variant="outline" asChild>
                <Link to="/products">
                    <Guitar className="w-4 h-4 mr-2" />
                    Produtos
                </Link>
            </Button>

            <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
            </Button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {isLoading && categoriesList.length === 0 ? (
            <div className="flex justify-center py-10">Carregando categorias...</div>
          ) : (
            <CategoryTable
              categories={categoriesList || []}    
              allCategories={categoriesList || []} 
              searchTerm={searchTerm}        
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span>{categoriesList?.length || 0} categoria(s)</span>
          <span>Ativas: {Array.isArray(categoriesList) ? categoriesList.filter(c => c.enabled).length : 0}</span>
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
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isEditing={!!editingCategory}
            allCategories={categoriesList || []} 
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
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;