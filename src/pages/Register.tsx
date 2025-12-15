import { useState, useEffect } from 'react'; // Adicionei useEffect
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Music,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('ADMIN');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
        navigate('/login');
    }
  }, [navigate]);

  const handleRegister = async (e) => { 
    e.preventDefault();
    setError('');
    setSuccess('');

     if (password.length < 8) {
    setError('A senha deve ter pelo menos 8 caracteres.');
    return;
  }

    setIsLoading(true);

    const dadosParaOJava = {
      name,
      login: email,
      password,
      role,
    };

    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dadosParaOJava),
      });

      if (response.ok) {
        setSuccess('Usuário registrado com sucesso!');
        setEmail('');
        setPassword('');
        setName('');
        setRole('ADMIN');

        setTimeout(() => navigate('/login'), 1500);
      } else {
        const textoErro = await response.text();
        setError(`Erro ao registrar: ${textoErro || response.status}`);
      }
    } catch {
      setError('Erro de conexão com o servidor (localhost:8080).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Voltar */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 z-20 gap-2"
        onClick={() => navigate('/login')}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/3 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      <div className="w-full max-w-md px-6 animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Registrar Usuário
          </h1>
          <p className="text-muted-foreground">
            Crie o usuário administrador do sistema
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary animate-fade-in">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  className="pl-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email (Login)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  className="pl-11"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Papel (Role)</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="SALES_MANAGER">Gerente de Vendas</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ASSISTANT">Assistente</SelectItem>
                  <SelectItem value="SHIPPING_MANAGER">Gerente de Envio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                className="pl-11"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha forte"
                required
                minLength={8}
                />
              </div>

              {password.length > 0 && password.length < 8 && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">
                      A senha deve conter no mínimo 8 caracteres
                    </p>
                  </div>
                )}
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Usuário'
              )}
            </Button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
