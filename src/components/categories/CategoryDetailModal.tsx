import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Category, getCategoryImageUrl } from '@/types/category';
import { Check, X, Tag } from 'lucide-react';

interface CategoryDetailModalProps {
  category: Category | null;
  allCategories: Category[];
  open: boolean;
  onClose: () => void;
}

const CategoryDetailModal = ({ category, allCategories, open, onClose }: CategoryDetailModalProps) => {
  if (!category) return null;

  const getParentName = (parentId: string | null) => {
    if (!parentId) return 'Nenhuma (categoria raiz)';
    const parent = allCategories.find(c => c.id === parentId);
    return parent?.name || 'N/A';
  };

  const getChildCategories = () => {
    return allCategories.filter(c => c.parentId === category.id);
  };

  const children = getChildCategories();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{category.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image and Status */}
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
              <img 
                src={getCategoryImageUrl(category.imageFilename)}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder.png';
                }}
              />
            </div>
            <div className="flex-1 space-y-3">
              <Badge variant={category.isEnabled ? 'default' : 'secondary'}>
                {category.isEnabled ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                {category.isEnabled ? 'Ativa' : 'Inativa'}
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-mono text-sm">{category.id}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Hierarchy */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Hierarquia
            </h3>
            <div className="space-y-3">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Categoria Pai</p>
                <p className="font-medium">{getParentName(category.parentId)}</p>
              </div>
              
              {children.length > 0 && (
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Subcategorias ({children.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {children.map(child => (
                      <Badge key={child.id} variant="outline">
                        {child.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Filename */}
          {category.imageFilename && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Arquivo de Imagem</p>
                <p className="font-mono text-sm">{category.imageFilename}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDetailModal;
