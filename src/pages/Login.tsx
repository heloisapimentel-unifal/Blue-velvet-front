import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';


import {
  Music,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (password.length < 8) {
    setError('A senha deve ter pelo menos 8 caracteres.');
    return;
  }
    setLoading(true);

    try {
        const result = await login(email, password, remember);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erro ao fazer login.');
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      <div className="w-full max-w-md px-6 animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Blue Velvet
          </h1>
          <p className="text-muted-foreground">
            Faça login para acessar o painel
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erro */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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

            {/* Credenciais Lembradas */}
<div className="flex items-center space-x-2">
  <Checkbox
    id="remember"
    checked={remember}
    onCheckedChange={(checked) => setRemember(checked as boolean)}
  />
  <Label
    htmlFor="remember"
    className="text-sm text-muted-foreground cursor-pointer"
  >
    Lembrar credenciais
  </Label>
</div>


            {/* Botão */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Aviso */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta? Entre em contato com um administrador da empresa.
          </p>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Credenciais de teste:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-secondary/50">
              <p className="text-primary font-medium">Admin</p>
              <p className="text-muted-foreground">admin@gmail.com</p>
              <p className="text-muted-foreground">senha1234</p>
            </div>

            <div className="p-2 rounded bg-secondary/50">
              <p className="text-primary font-medium">Usuário</p>
              <p className="text-muted-foreground">user@exemplo.com</p>
              <p className="text-muted-foreground">senha1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
