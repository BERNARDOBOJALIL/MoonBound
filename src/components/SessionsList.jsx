import { useEffect, useState } from 'react';
import { getSessions, deleteSession } from '../lib/api';
import { BookOpen, RefreshCw, AlertCircle, Moon, Cloud, Sparkles, Star, Zap, Trash2 } from 'lucide-react';

export default function SessionsList({ onSelect, limit = 5 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getSessions(limit);
      console.log('🔍 Sessions response RAW:', data);
      console.log('🔍 Response type:', typeof data);
      console.log('🔍 Response keys:', Object.keys(data));
      
      let sessionsArray = [];
      
      if (Array.isArray(data)) {
        // Si es un array directamente
        sessionsArray = data;
        console.log('✅ Is array directly');
      } else if (data?.sessions && Array.isArray(data.sessions)) {
        // Si viene en formato { sessions: [...] }
        sessionsArray = data.sessions;
        console.log('✅ Extracted from data.sessions, length:', sessionsArray.length);
      } else if (data && typeof data === 'object') {
        // Si es un objeto con keys como IDs: { "uuid1": {...}, "uuid2": {...} }
        sessionsArray = Object.entries(data).map(([id, session]) => ({
          ...session,
          id: session.id || id
        }));
        console.log('✅ Converted object to array with IDs, length:', sessionsArray.length);
      }
      
      console.log('📊 Sessions count:', sessionsArray.length);
      if (sessionsArray.length > 0) {
        console.log('📋 First session keys:', Object.keys(sessionsArray[0]));
        console.log('📋 First session:', sessionsArray[0]);
      }
      setItems(sessionsArray);
    } catch (e) {
      console.error('Error loading sessions:', e);
      setError(e.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  async function handleDelete(sessionId, e) {
    e.stopPropagation();
    if (!confirm('¿Seguro que quieres eliminar este sueño?')) return;
    
    setDeletingId(sessionId);
    try {
      await deleteSession(sessionId);
      setItems(prev => prev.filter(s => (s.id || s._id || s.sesion_id || s.session_id) !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('Error al eliminar: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function formatDateGMT6(dateString) {
    if (!dateString) return '';
    try {
      // El backend devuelve en UTC, debemos convertir a GMT-6
      const date = new Date(dateString);
      
      // Restar 6 horas para GMT-6 (CST)
      const gmt6Date = new Date(date.getTime() - (6 * 60 * 60 * 1000));
      
      const today = new Date();
      const isToday = gmt6Date.toDateString() === today.toDateString();
      
      if (isToday) {
        return 'Hoy, ' + gmt6Date.toLocaleTimeString('es-MX', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      }
      return gmt6Date.toLocaleDateString('es-MX', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm">
        <div>
          <h3 className="text-lg font-bold text-[#2C5282] flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Mis Sueños
          </h3>
          {items.length > 0 && (
            <span className="text-xs text-[#4A7BA7] mt-1">{items.length} conversaciones</span>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-xl bg-[#D6E7F5] hover:bg-[#C4DCF0] disabled:opacity-50 transition-all transform hover:scale-110 active:scale-95"
          title="Actualizar lista"
        >
          <RefreshCw className={`w-4 h-4 text-[#2C5282] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm slide-up flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div>
            <div className="font-semibold">Error</div>
            <div className="mt-1">{error}</div>
            {error.includes('401') || error.includes('403') || error.includes('Unauthorized') ? (
              <div className="mt-2 text-xs">Tu sesión puede haber expirado.</div>
            ) : null}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {items.length === 0 && !loading && (
          <div className="p-8 rounded-3xl bg-white/40 backdrop-blur-sm border-2 border-dashed border-[#A8C5E0] text-center">
            <Moon className="w-12 h-12 mx-auto mb-3 text-[#6B9BD1]" />
            <div className="text-[#2C5282] font-medium mb-1">
              {error ? 'No se pudieron cargar' : 'Aún no hay sueños'}
            </div>
            <div className="text-sm text-[#4A7BA7]">
              {error ? 'Intenta recargar' : 'Interpreta tu primer sueño'}
            </div>
          </div>
        )}
        
        {loading && items.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-8 rounded-full matcha-gradient flex items-center justify-center pulse-slow">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#4A7BA7]">Cargando...</span>
            </div>
          </div>
        )}
        
        {items.map((s, idx) => {
          const sessionId = s.id || s._id || s.sesion_id || s.session_id || `session-${idx}`;
          const createdAt = s.created_at || s.fecha || s.timestamp || s.date || '';
          const resumen = s.interpretacion_resumen || s.resumen || s.texto_sueno || 'Sin resumen disponible';
          
          // Título: intenta usar title/titulo del backend, o genera uno inteligente
          let title = s.title || s.titulo || s.texto_sueno;
          
          if (!title && resumen) {
            // Generar título inteligente: buscar el tema principal en el resumen
            // Intentar extraer después de palabras clave como "sueño de", "soñaste", etc.
            const lowerResumen = resumen.toLowerCase();
            
            // Patrones para extraer el tema
            const patterns = [
              /sueño de (.*?)[.,\n]/,
              /sueño con (.*?)[.,\n]/,
              /soñar con (.*?)[.,\n]/,
              /soñaste (.*?)[.,\n]/,
              /imagen de (.*?)[.,\n]/,
              /acto de (.*?)[.,\n]/
            ];
            
            for (const pattern of patterns) {
              const match = lowerResumen.match(pattern);
              if (match && match[1]) {
                title = match[1].trim();
                // Capitalizar primera letra
                title = title.charAt(0).toUpperCase() + title.slice(1);
                // Limitar longitud
                if (title.length > 40) title = title.substring(0, 40) + '...';
                break;
              }
            }
            
            // Si no encontró patrón, usar primeras palabras significativas
            if (!title) {
              const words = resumen
                .split(' ')
                .filter(w => w.length > 3) // Filtrar palabras cortas
                .slice(0, 5)
                .join(' ');
              title = words.length > 40 ? words.substring(0, 40) + '...' : words;
            }
          }
          
          title = title || 'Sueño sin título';
          const resumenPreview = resumen.length > 80 ? resumen.substring(0, 80) + '...' : resumen;
          
          // Iconos variados de Lucide
          const icons = [
            <Cloud key="cloud" className="w-5 h-5" />,
            <Moon key="moon" className="w-5 h-5" />,
            <Sparkles key="sparkles" className="w-5 h-5" />,
            <Star key="star" className="w-5 h-5" />,
            <Zap key="zap" className="w-5 h-5" />
          ];
          const icon = icons[idx % icons.length];
          const isDeleting = deletingId === sessionId;
          
          return (
            <div key={sessionId} className="fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div
                className="relative w-full p-4 rounded-2xl bg-white hover:bg-white/95 backdrop-blur-sm border-2 border-transparent hover:border-[#6B9BD1] transition-all group transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => {
                    console.log('✅ Selected session ID:', sessionId);
                    onSelect?.(sessionId);
                  }}
                  className="w-full text-left"
                  disabled={isDeleting}
                >
                  {/* Header con ícono, título y fecha */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-[#4A7BA7] flex-shrink-0">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#2C5282] truncate">{title}</h4>
                        {createdAt && (
                          <span className="text-xs text-[#7FA3CC]">
                            {formatDateGMT6(createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Dream Summary */}
                  <p className="text-xs text-[#1A365D] leading-relaxed mb-2 line-clamp-2">
                    {resumenPreview}
                  </p>
                  
                  {/* Hover Action */}
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-[#4A7BA7] opacity-0 group-hover:opacity-100 transition-opacity font-medium flex items-center gap-1">
                      Ver conversación →
                    </span>
                  </div>
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(sessionId, e)}
                  disabled={isDeleting}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50"
                  title="Eliminar sueño"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
