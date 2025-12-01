import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Music, Mail, Lock, AlertCircle, Loader2, Disc3 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, remember);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background musical elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        {/* Decorative music icons */}
        <Disc3 className="absolute top-20 right-[15%] w-12 h-12 text-primary/10 animate-spin" style={{ animationDuration: '8s' }} />
        <Music className="absolute bottom-32 left-[10%] w-8 h-8 text-primary/10" />
        <Disc3 className="absolute top-1/2 left-[5%] w-6 h-6 text-primary/5 animate-spin" style={{ animationDuration: '12s' }} />
      </div>

      <div className="w-full max-w-md px-6 animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 relative">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Blue Velvet</h1>
          <p className="text-sm font-medium text-primary/80 tracking-widest uppercase mb-2">Management</p>
          <p className="text-muted-foreground">Faça login para acessar o painel</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Lembrar credenciais 
              </Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
  Não tem uma conta? Entre em contato com um administrador da empresa.
</p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground text-center mb-2">Credenciais de teste:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-secondary/50">
              <p className="text-primary font-medium">Admin</p>
              <p className="text-muted-foreground">admin@exemplo.com</p>
              <p className="text-muted-foreground">senha1234</p>
            </div>
            <div className="p-2 rounded bg-secondary/50">
              <p className="text-primary font-medium">Sales Manager</p>
              <p className="text-muted-foreground">vendedor@exemplo.com</p>
              <p className="text-muted-foreground">senha1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
