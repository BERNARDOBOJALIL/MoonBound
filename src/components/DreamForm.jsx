import { useState, useRef } from 'react';
import { interpretText, generateImage } from '../lib/api';
import { Sparkles, Cloud, Heart, Save, FileText, Paperclip, Trash2, Loader2, AlertCircle, Key, File, Image as ImageIcon, Download } from 'lucide-react';

export default function DreamForm({ onNewSession }) {
  const [texto, setTexto] = useState('');
  const [contexto, setContexto] = useState('');
  const [save, setSave] = useState(false);
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await interpretText({
        texto_sueno: texto,
        contexto_emocional: contexto,
        save,
        filename,
      });
      console.log('=== RESULT RECEIVED ===');
      console.log('Full result:', data);
      console.log('Has image_url:', !!data.image_url);
      console.log('Image URL type:', typeof data.image_url);
      if (data.image_url) {
        console.log('Image URL length:', data.image_url.length);
        console.log('Image URL starts with:', data.image_url.substring(0, 50));
      }
      console.log('======================');
      setResult(data);
      if (data?.sesion_id && onNewSession) onNewSession(data.sesion_id);
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  function handleFilePick(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTexto(String(reader.result || ''));
    };
    reader.onerror = () => setError('No se pudo leer el archivo');
    reader.readAsText(file, 'utf-8');
  }

  function clearForm() {
    setTexto('');
    setContexto('');
    setSave(false);
    setFilename('');
    setError('');
    setResult(null);
    setImageResult(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleGenerateImage() {
    if (!texto.trim()) {
      setImageError('Primero describe tu sueño');
      return;
    }
    
    setImageError('');
    setImageResult(null);
    setGeneratingImage(true);
    
    try {
      const data = await generateImage(texto, contexto || 'arte digital vibrante');
      console.log('=== IMAGE GENERATION RESULT ===');
      console.log('Full data:', data);
      console.log('Has imagen_url:', !!data.imagen_url);
      console.log('Has image_url:', !!data.image_url);
      if (data.imagen_url || data.image_url) {
        const url = data.imagen_url || data.image_url;
        console.log('Image URL length:', url.length);
        console.log('Image URL starts with:', url.substring(0, 50));
      }
      console.log('===============================');
      setImageResult(data);
    } catch (err) {
      setImageError(err.message || 'Error al generar imagen');
    } finally {
      setGeneratingImage(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C5282] flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            Interpreta tu sueño
          </h2>
          <p className="text-xs sm:text-sm text-[#4A7BA7] mt-1">Describe lo que soñaste y descubre su significado</p>
        </div>

        {/* Dream Input */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5A6B4F] mb-2 ml-1">
            <Cloud className="w-3 h-3 sm:w-4 sm:h-4" />
            Describe tu sueño
          </label>
          <textarea
            className="w-full h-32 sm:h-40 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F0F7FF] border-2 border-transparent text-[#1A365D] placeholder-[#7FA3CC] focus:outline-none focus:border-[#6B9BD1] transition-all resize-none text-sm sm:text-base"
            placeholder="Anoche soñé que volaba sobre una ciudad iluminada..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
          />
        </div>

        {/* Emotional Context */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2C5282] mb-2 ml-1">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
            Contexto emocional (opcional)
          </label>
          <input
            className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#F0F7FF] border-2 border-transparent text-[#1A365D] placeholder-[#7FA3CC] focus:outline-none focus:border-[#6B9BD1] transition-all text-sm sm:text-base"
            placeholder="Alegría, ansiedad, nostalgia, miedo..."
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
          />
        </div>

        {/* Save Options */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-[#F0F7FF]/50">
          <div className="flex items-center gap-2">
            <input
              id="save"
              type="checkbox"
              checked={save}
              onChange={(e) => setSave(e.target.checked)}
              className="w-4 h-4 rounded border-[#6B9BD1] text-[#4A7BA7] focus:ring-[#6B9BD1]"
            />
            <label htmlFor="save" className="flex items-center gap-2 text-xs sm:text-sm text-[#2C5282] font-medium cursor-pointer">
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              Guardar archivo
            </label>
          </div>
          {save && (
            <input
              className="flex-1 w-full sm:w-auto sm:min-w-[200px] p-2 rounded-lg bg-white border border-[#A8C5E0] text-[#1A365D] placeholder-[#7FA3CC] focus:outline-none focus:border-[#6B9BD1] transition-all text-sm"
              placeholder="Nombre del archivo (opcional)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:flex-1 sm:min-w-[200px] matcha-gradient text-white font-semibold py-3 sm:py-3.5 rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Interpretando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Interpretar sueño
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={generatingImage || !texto.trim()}
            className="w-full sm:flex-1 sm:min-w-[200px] matcha-soft text-white font-semibold py-3 sm:py-3.5 rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
          >
            {generatingImage ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Generando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Generar imagen
              </span>
            )}
          </button>
          
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={clearForm}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#D6E7F5] hover:bg-[#C4DCF0] text-[#2C5282] font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar</span>
            </button>

            {/* File Import */}
            <div className="relative flex-1 sm:flex-none">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFilePick}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                type="button"
                className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl matcha-soft text-white font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Paperclip className="w-4 h-4" />
                <span>Importar</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 slide-up p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Error */}
      {imageError && (
        <div className="mt-4 slide-up p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{imageError}</span>
        </div>
      )}

      {/* Image Result */}
      {imageResult && (
        <div className="mt-6 fade-in">
          <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#E8E5DD]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-[#4A7BA7]" />
                <h3 className="font-bold text-lg text-[#2C5282]">Imagen generada</h3>
              </div>
              {(imageResult.imagen_url || imageResult.image_url) && (
                <button
                  onClick={() => {
                    const imgUrl = imageResult.imagen_url || imageResult.image_url;
                    const link = document.createElement('a');
                    link.href = imgUrl.startsWith('data:') ? imgUrl : `data:image/png;base64,${imgUrl}`;
                    link.download = `sueno-generado-${Date.now()}.png`;
                    link.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B9BD1] to-[#4A7BA7] hover:from-[#5A8BC1] hover:to-[#396A97] text-white text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              )}
            </div>
            
            {console.log('Rendering imageResult:', {
              hasImagenUrl: !!imageResult.imagen_url,
              hasImageUrl: !!imageResult.image_url,
              descripcion: imageResult.descripcion
            })}
            
            {(imageResult.imagen_url || imageResult.image_url) && (
              <div className="rounded-2xl overflow-hidden shadow-md mb-4 bg-gray-50">
                <img 
                  src={(imageResult.imagen_url || imageResult.image_url).startsWith('data:') 
                    ? (imageResult.imagen_url || imageResult.image_url)
                    : `data:image/png;base64,${imageResult.imagen_url || imageResult.image_url}`}
                  alt={imageResult.descripcion || "Visualización del sueño"} 
                  className="w-full h-auto"
                  onLoad={(e) => console.log('✅ Generated image loaded successfully')}
                  onError={(e) => {
                    console.error('❌ Generated image load error');
                    console.error('Src starts with:', e.target.src.substring(0, 100));
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">Imagen no disponible</text></svg>';
                  }}
                />
              </div>
            )}
            
            {imageResult.descripcion && (
              <p className="text-sm text-[#4A7BA7] italic">
                "{imageResult.descripcion}"
              </p>
            )}
            
            {imageResult.prompt && (
              <div className="mt-3 p-3 rounded-xl bg-[#F0F7FF] text-xs text-[#2C5282]">
                <strong>Prompt usado:</strong> {imageResult.prompt}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4 fade-in">
          {/* Debug info */}
          {console.log('Rendering result. Has image_url:', !!result.image_url)}
          
          {/* Image from interpretation result */}
          {result.image_url && (
            <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#E8E5DD]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-[#4A7BA7]" />
                  <h3 className="font-bold text-lg text-[#2C5282]">Visualización del sueño</h3>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result.image_url.startsWith('data:') ? result.image_url : `data:image/png;base64,${result.image_url}`;
                    link.download = `sueno-${result.sesion_id?.slice(0,8) || Date.now()}.png`;
                    link.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B9BD1] to-[#4A7BA7] hover:from-[#5A8BC1] hover:to-[#396A97] text-white text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
              
              <div className="rounded-2xl overflow-hidden shadow-md mb-4 bg-gray-50">
                <img 
                  src={result.image_url.startsWith('data:') ? result.image_url : `data:image/png;base64,${result.image_url}`}
                  alt={result.descripcion || "Visualización del sueño"} 
                  className="w-full h-auto"
                  onLoad={(e) => console.log('✅ Image loaded successfully')}
                  onError={(e) => {
                    console.error('❌ Image load error. Src:', e.target.src.substring(0, 100));
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">Error al cargar imagen</text></svg>';
                  }}
                />
              </div>
              
              {result.descripcion && (
                <p className="text-sm text-[#4A7BA7] italic mb-2">
                  "{result.descripcion}"
                </p>
              )}
              
              <div className="flex gap-3 text-xs text-[#7FA3CC]">
                {result.estilo && (
                  <div>
                    <strong>Estilo:</strong> {result.estilo}
                  </div>
                )}
                {result.size && (
                  <div>
                    <strong>Tamaño:</strong> {result.size}
                  </div>
                )}
              </div>
            </div>
          )}

          {result.interpretacion && (
            <section className="p-6 rounded-3xl matcha-soft text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <h3 className="font-bold text-lg">Interpretación</h3>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{result.interpretacion}</p>
            </section>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {result.sesion_id && (
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-[#A8C5E0] text-[#2C5282]">
                <div className="flex items-center gap-2 font-semibold">
                  <Key className="w-4 h-4" />
                  ID de sesión
                </div>
                <p className="text-sm font-mono mt-1 text-[#4A7BA7] truncate">{result.sesion_id}</p>
              </div>
            )}
            {result.ruta_salida && (
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-[#A8C5E0] text-[#2C5282]">
                <div className="flex items-center gap-2 font-semibold">
                  <File className="w-4 h-4" />
                  Archivo guardado
                </div>
                <p className="text-sm mt-1 text-[#4A7BA7] truncate">{result.ruta_salida}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
