import { useEffect, useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import DreamForm from './components/DreamForm'
import SessionsList from './components/SessionsList'
import SessionDetail from './components/SessionDetail'
import { apiBase, health } from './lib/api'
import { Moon, User, LogOut, Loader2, MessageSquare, BookOpen, AlertCircle } from 'lucide-react'

function MainApp() {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('interpretar');
  const [selectedSession, setSelectedSession] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await health();
        setApiStatus('ok');
      } catch (e) {
        setApiError(e.message || 'API no disponible');
        setApiStatus('error');
      }
    })();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full matcha-gradient flex items-center justify-center shadow-lg pulse-slow">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-[#5A6B4F] text-lg font-medium">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header con gradiente matcha */}
      <header className="matcha-gradient shadow-lg sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">MoonBound</h1>
          </div>
          
          {user && (
            <div className="ml-auto flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                <User className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">
                  {user.nombre || user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Error API */}
      {apiStatus === 'error' && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="slide-up p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar de sesiones - Fixed */}
        <aside className="hidden lg:block w-[300px] flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <SessionsList 
              onSelect={(id) => { 
                setSelectedSession(id); 
                setActiveTab('sesiones'); 
              }} 
            />
          </div>
        </aside>

        {/* Área principal */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Tabs */}
          <nav className="flex gap-2 p-1.5 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
            <button
              onClick={() => setActiveTab('interpretar')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all transform ${
                activeTab === 'interpretar'
                  ? 'matcha-gradient text-white shadow-md scale-105'
                  : 'text-[#7B8A6F] hover:bg-white/50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Interpretar</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sesiones')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all transform ${
                activeTab === 'sesiones'
                  ? 'matcha-gradient text-white shadow-md scale-105'
                  : 'text-[#7B8A6F] hover:bg-white/50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Conversaciones</span>
              </span>
            </button>
          </nav>

          {/* Contenido */}
          <div className="fade-in">
            {activeTab === 'interpretar' && (
              <DreamForm 
                onNewSession={(id) => { 
                  setSelectedSession(id); 
                  setActiveTab('sesiones'); 
                }} 
              />
            )}

            {activeTab === 'sesiones' && (
              <SessionDetail sessionId={selectedSession} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full matcha-gradient flex items-center justify-center shadow-lg pulse-slow">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-[#5A6B4F] text-lg font-medium">Cargando...</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <MainApp /> : <LoginForm />;
}

export default App

