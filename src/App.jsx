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
  const [showSidebar, setShowSidebar] = useState(false);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">MoonBound</h1>
          </div>
          
          {user && (
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                <User className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">
                  {user.nombre || user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-medium transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar desplegable en móvil */}
          <aside className="lg:block w-full lg:w-[300px] flex-shrink-0">
            {/* Toggle button solo en móvil */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden w-full mb-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-between text-[#2C5282] font-medium hover:bg-white transition-all"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Mis Sueños</span>
              </div>
              <span className={`transform transition-transform ${showSidebar ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {/* Sidebar content */}
            <div className={`lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto ${
              showSidebar ? 'block' : 'hidden'
            }`}>
              <div className="lg:hidden mb-4">
                <SessionsList 
                  onSelect={(id) => { 
                    setSelectedSession(id); 
                    setActiveTab('sesiones');
                    setShowSidebar(false); // Cerrar sidebar al seleccionar
                  }} 
                />
              </div>
              <div className="hidden lg:block">
                <SessionsList 
                  onSelect={(id) => { 
                    setSelectedSession(id); 
                    setActiveTab('sesiones'); 
                  }} 
                />
              </div>
            </div>
          </aside>

          {/* Área principal */}
          <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
          {/* Tabs */}
          <nav className="flex gap-2 p-1.5 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
            <button
              onClick={() => setActiveTab('interpretar')}
              className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all transform text-sm sm:text-base ${
                activeTab === 'interpretar'
                  ? 'matcha-gradient text-white shadow-md scale-105'
                  : 'text-[#7B8A6F] hover:bg-white/50'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Interpretar</span>
                <span className="sm:hidden">Nuevo</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sesiones')}
              className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all transform text-sm sm:text-base ${
                activeTab === 'sesiones'
                  ? 'matcha-gradient text-white shadow-md scale-105'
                  : 'text-[#7B8A6F] hover:bg-white/50'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Conversaciones</span>
                <span className="sm:hidden">Historial</span>
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

