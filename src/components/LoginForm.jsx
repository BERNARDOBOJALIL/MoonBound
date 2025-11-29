import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Moon, Mail, Lock, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, nombre);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full matcha-gradient mb-4 shadow-lg">
            <Moon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#2C5282] mb-2">MoonBound</h1>
          <p className="text-[#4A7BA7]">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Comienza tu viaje onírico'}
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-5">
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2C5282] mb-2 ml-1">
                <Mail className="w-4 h-4" />
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#F0F7FF] border-2 border-transparent text-[#1A365D] placeholder-[#7FA3CC] focus:outline-none focus:border-[#6B9BD1] transition-all"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2C5282] mb-2 ml-1">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[#F0F7FF] border-2 border-transparent text-[#1A365D] placeholder-[#7FA3CC] focus:outline-none focus:border-[#6B9BD1] transition-all"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Nombre Input (only for register) */}
            {mode === 'register' && (
              <div className="slide-up">
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C5282] mb-2 ml-1">
                  <User className="w-4 h-4" />
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-[#F0F7FF] border-2 border-transparent text-[#1A365D] placeholder-[#7FA3CC] focus:outline-none focus:border-[#6B9BD1] transition-all"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="slide-up p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full matcha-gradient text-white font-semibold py-3.5 rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </span>
            ) : mode === 'login' ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Iniciar sesión
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Crear cuenta
              </span>
            )}
          </button>

          {/* Toggle Mode */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-[#4A7BA7] hover:text-[#2C5282] font-medium transition-colors"
            >
              {mode === 'login' ? (
                <>¿No tienes cuenta? <span className="underline">Regístrate aquí</span></>
              ) : (
                <>¿Ya tienes cuenta? <span className="underline">Inicia sesión</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
