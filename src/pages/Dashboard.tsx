import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Music,
  LogOut,
  User,
  BarChart3,
  Truck,
  FileEdit,
  UserPlus,
  Tag,
  Guitar,
  Shield,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useEffect } from 'react';

/* =========================
   Normalização de Role
========================= */
const normalizeRole = (role?: string) => {
  if (!role) return 'Assistant';
  const upper = role.toUpperCase();

  if (upper === 'ADMIN' || upper === 'ROLE_ADMIN') return 'Administrator';
  if (upper === 'USER' || upper === 'ROLE_USER') return 'Assistant';

  return role;
};

const getRoleIcon = (role?: string) => {
  const visualRole = normalizeRole(role);
  switch (visualRole) {
    case 'Administrator':
      return Shield;
    case 'Sales Manager':
      return BarChart3;
    case 'Editor':
      return FileEdit;
    case 'Assistant':
      return User;
    case 'Shipping Manager':
      return Truck;
    default:
      return User;
  }
};

const getRoleColor = (role?: string) => {
  const visualRole = normalizeRole(role);
  switch (visualRole) {
    case 'Administrator':
      return 'bg-primary/20 text-primary';
    case 'Sales Manager':
      return 'bg-green-500/20 text-green-400';
    case 'Editor':
      return 'bg-purple-500/20 text-purple-400';
    case 'Assistant':
      return 'bg-blue-500/20 text-blue-400';
    case 'Shipping Manager':
      return 'bg-orange-500/20 text-orange-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const Dashboard = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  /* =========================
     Proteção de rota correta
  ========================= */
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading || !user) return null;

  /* =========================
     Dados seguros para UI
  ========================= */
  const displayRole = normalizeRole(user.role);
  const displayName = user.name || 'Usuário';
  const displayEmail = user.email || user.login || 'Sem email';

  const RoleIcon = getRoleIcon(user.role);
  const isAdmin =
    user.role === 'ADMIN' || displayRole === 'Administrator';

  const menuItems = [
    { icon: Guitar, label: 'Produtos', description: 'Gerenciar catálogo', href: '/products' },
    { icon: Tag, label: 'Categorias', description: 'Gerenciar categorias', href: '/categories' },
    { icon: Store, label: 'Vitrine', description: 'Ver loja do cliente', href: '/store', external: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ================= Header ================= */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Blue Velvet
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50">
              <div className={`p-1.5 rounded-md ${getRoleColor(user.role)}`}>
                <RoleIcon className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayRole}</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ================= Main ================= */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {displayName.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo da Blue Velvet Music Store.
          </p>
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="mb-8 p-6 glass-card rounded-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Ações de Administrador
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie usuários do sistema
                </p>
              </div>
            </div>

            <Button asChild>
              <Link to="/register">
                <UserPlus className="w-4 h-4 mr-2" />
                Registrar Novo Usuário
              </Link>
            </Button>
          </div>
        )}

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.href}
              target={item.external ? '_blank' : undefined}
              className="glass-card p-6 rounded-xl hover:border-primary/30 transition-all duration-200 group animate-fade-in hover-lift"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary group-hover:bg-primary/10">
                  <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {item.label}
                    </h3>
                    {item.external && (
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-8 p-6 glass-card rounded-2xl animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4">
            Informações da Conta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Nome</p>
              <p className="font-medium text-foreground">{displayName}</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">E-mail</p>
              <p className="font-medium text-foreground">{displayEmail}</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Papel</p>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                  user.role
                )}`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                {displayRole}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
