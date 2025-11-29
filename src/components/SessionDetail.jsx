import { useEffect, useState } from 'react';
import { getSessionById, sendFollowup } from '../lib/api';
import { Moon, RefreshCw, AlertCircle, Cloud, Sparkles, MessageCircle, Send, Loader2, HelpCircle, Image as ImageIcon, Download } from 'lucide-react';

export default function SessionDetail({ sessionId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  async function load() {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    setLastResponse(null);
    console.log('Loading session with ID:', sessionId);
    console.log('ID type:', typeof sessionId);
    try {
      const d = await getSessionById(sessionId);
      console.log('Session data received:', d);
      console.log('Followups:', d?.followups);
      setData(d);
    } catch (e) {
      console.error('Error loading session:', e);
      console.error('Failed session ID:', sessionId);
      setError(e.message || 'Error al cargar la sesión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function onSend() {
    if (!question.trim()) return;
    setSending(true);
    setError('');
    setLastResponse(null);
    try {
      const result = await sendFollowup(sessionId, question.trim());
      console.log('Follow-up result:', result);
      
      // Mostrar la respuesta inmediatamente si está disponible
      if (result?.respuesta) {
        setLastResponse({ pregunta: question.trim(), respuesta: result.respuesta });
      }
      
      setQuestion('');
      // Recargar sesión para ver el nuevo follow-up
      await load();
    } catch (e) {
      console.error('Error en follow-up:', e);
      setError(e.message || 'Error al enviar seguimiento');
    } finally {
      setSending(false);
    }
  }

  if (!sessionId) {
    return (
      <div className="p-8 rounded-3xl bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#C8D5B9]">
        <div className="text-center text-[#4A7BA7]">
          <Moon className="w-16 h-16 mx-auto mb-4 text-[#6B9BD1]" />
          <p className="text-lg font-medium">Selecciona una sesión para ver la conversación</p>
          <p className="text-sm mt-2">Las sesiones aparecen en el panel lateral</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[#4A7BA7]">Conversación</h3>
          <code className="text-xs text-[#7FA3CC] font-mono">{sessionId.slice(0, 8)}...</code>
        </div>
        <button 
          onClick={load} 
          disabled={loading} 
          className="px-4 py-2 rounded-xl bg-[#D6E7F5] hover:bg-[#C4DCF0] disabled:opacity-50 text-[#2C5282] font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Recargar'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 slide-up p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700">
          <div className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Error al cargar sesión
          </div>
          <div className="text-sm mt-1">{error}</div>
          {error.includes('404') || error.toLowerCase().includes('not found') || error.toLowerCase().includes('no encontrada') ? (
            <div className="text-xs mt-3 p-3 bg-red-100 rounded-xl">
              <strong>Posibles causas:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>La sesión fue eliminada</li>
                <li>El ID no es válido</li>
                <li>La sesión pertenece a otro usuario</li>
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Chat Container */}
      {data ? (
        <div className="space-y-4">
          {/* Dream Message (User) */}
          {data.texto_sueno && (
            <div className="flex justify-end fade-in">
              <div className="max-w-[75%] p-5 rounded-2xl rounded-tr-sm matcha-gradient text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wide opacity-90">Tu sueño</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{data.texto_sueno}</p>
              </div>
            </div>
          )}

          {/* Image Visualization */}
          {data.image_url && (
            <div className="flex justify-start fade-in">
              <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-white shadow-lg border border-[#E8E5DD]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#4A7BA7]" />
                    <span className="text-xs font-bold uppercase tracking-wide text-[#4A7BA7]">Visualización</span>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = data.image_url.startsWith('data:') ? data.image_url : `data:image/png;base64,${data.image_url}`;
                      link.download = `sueno-${data.sesion_id?.slice(0,8) || 'imagen'}.png`;
                      link.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B9BD1] to-[#4A7BA7] hover:from-[#5A8BC1] hover:to-[#396A97] text-white text-xs font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden shadow-md mb-3 bg-gray-50">
                  <img 
                    src={data.image_url.startsWith('data:') ? data.image_url : `data:image/png;base64,${data.image_url}`}
                    alt={data.descripcion || "Visualización del sueño"} 
                    className="w-full h-auto"
                    onLoad={(e) => console.log('Session image loaded')}
                    onError={(e) => {
                      console.error('Session image load error');
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">Error al cargar imagen</text></svg>';
                    }}
                  />
                </div>
                {data.descripcion && (
                  <p className="text-xs text-[#4A7BA7] italic leading-relaxed">"{data.descripcion}"</p>
                )}
              </div>
            </div>
          )}

          {/* Interpretation Message (AI) */}
          {data.interpretacion && (
            <div className="flex justify-start fade-in">
              <div className="max-w-[85%] p-5 rounded-2xl rounded-tl-sm bg-white shadow-lg border border-[#E8E5DD] text-[#1A365D]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#4A7BA7]" />
                  <span className="text-xs font-bold uppercase tracking-wide text-[#4A7BA7]">Interpretación</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{data.interpretacion}</p>
              </div>
            </div>
          )}
          
          {/* Follow-ups (Chat Bubbles) */}
          {(Array.isArray(data.followups) && data.followups.length > 0) || (data.follow_ups && Array.isArray(data.follow_ups) && data.follow_ups.length > 0) ? (
            <div className="space-y-3 pt-4 border-t-2 border-[#E8E5DD]">
              {(data.followups || data.follow_ups).map((f, idx) => (
                <div key={idx} className="space-y-3 slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Question (User) */}
                  <div className="flex justify-end">
                    <div className="max-w-[70%] p-4 rounded-2xl rounded-tr-sm matcha-soft text-white shadow-md">
                      <p className="text-[14px] leading-relaxed">{f.pregunta || f.question}</p>
                      {f.timestamp && (
                        <div className="text-[11px] opacity-70 mt-2">{new Date(f.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</div>
                      )}
                    </div>
                  </div>

                  {/* Answer (AI) */}
                  <div className="flex justify-start">
                    <div className="max-w-[75%] p-4 rounded-2xl rounded-tl-sm bg-white shadow-md border border-[#E8E5DD] text-[#1A365D]">
                      <p className="text-[14px] leading-relaxed">{f.respuesta || f.answer || f.response}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Last Response Preview */}
          {lastResponse && (
            <div className="slide-up space-y-3 pt-4">
              <div className="flex justify-end">
                <div className="max-w-[75%] p-3 rounded-2xl rounded-tr-md matcha-soft text-white shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold opacity-90">Tu pregunta</span>
                  </div>
                  <p className="text-sm">{lastResponse.pregunta}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 rounded-2xl rounded-tl-md bg-green-50 border-2 border-green-200 text-green-900 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold">Nueva respuesta</span>
                  </div>
                  <p className="text-sm leading-relaxed">{lastResponse.respuesta}</p>
                </div>
              </div>
            </div>
          )}

          {/* Input Area (Chat Style) */}
          <div className="sticky bottom-0 pt-6 mt-6">
            <div className="p-5 rounded-2xl bg-white shadow-lg border border-[#E8E5DD]">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-[#4A7BA7]" />
                <h4 className="text-sm font-semibold text-[#2C5282]">Pregunta algo más</h4>
              </div>
              
              <div className="flex gap-3">
                <input
                  className="flex-1 px-4 py-3 rounded-xl bg-[#F0F7FF] border-2 border-transparent text-[#1A365D] placeholder-[#7FA3CC] focus:outline-none focus:border-[#6B9BD1] transition-all text-[15px]"
                  placeholder="¿Qué significa...?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !sending && question.trim() && onSend()}
                />
                <button 
                  onClick={onSend} 
                  disabled={sending || !question.trim()} 
                  className="px-5 py-3 rounded-xl matcha-gradient text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full matcha-gradient flex items-center justify-center shadow-lg pulse-slow">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
            <div className="text-[#4A7BA7] font-medium">Cargando conversación...</div>
          </div>
        </div>
      )}
    </div>
  );
}
