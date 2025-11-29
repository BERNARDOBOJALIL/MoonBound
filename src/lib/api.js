const DEFAULT_BASE_URL = 'https://traductordesue-osai.onrender.com';

const BASE_URL = import.meta?.env?.VITE_API_BASE || DEFAULT_BASE_URL;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem('dream_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };
  
  console.log(`API Request: ${options.method || 'GET'} ${path}`);
  console.log('Token present:', !!token);
  
  let res;
  try {
    res = await fetch(url, { ...options, headers, mode: 'cors' });
  } catch (networkErr) {
    const msg = networkErr?.message || 'Error de red desconocido';
    if (/Failed to fetch/i.test(msg) || /NetworkError/i.test(msg)) {
      throw new Error('Fallo de red o CORS: verifica que el backend permita origenes (Access-Control-Allow-Origin) y que la URL sea accesible. Detalle: ' + msg);
    }
    throw new Error(msg);
  }
  
  console.log(`API Response: ${res.status} ${res.statusText}`);
  
  const contentType = res.headers.get('content-type') || '';
  let data;
  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const message = typeof data === 'string' && data ? data : (data?.message || data?.detail || `HTTP ${res.status}`);
    throw new Error(message);
  }
  return data;
}

// Auth endpoints (public)
export async function register(email, password, nombre = '') {
  if (!email || !password) throw new Error('Email y contraseña son requeridos');
  if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  const body = { email, password, nombre };
  return request('/register', { method: 'POST', body: JSON.stringify(body) });
}

export async function login(email, password) {
  if (!email || !password) throw new Error('Email y contraseña son requeridos');
  const body = { email, password };
  return request('/login', { method: 'POST', body: JSON.stringify(body) });
}

export async function getMe() {
  return request('/me', { method: 'GET' });
}

// Health (public)
export async function health() {
  return request('/health', { method: 'GET' });
}

// Protected endpoints (require auth)
export async function interpretText({ texto_sueno, contexto_emocional = '', save = false, filename = '', offline = false }) {
  if (!texto_sueno || !texto_sueno.trim()) throw new Error('El texto del sueño es requerido');
  const body = { texto_sueno, contexto_emocional, save, filename, offline };
  return request('/interpret-text', { method: 'POST', body: JSON.stringify(body) });
}

export async function getSessions(limit = 5) {
  const q = new URLSearchParams({ limit: String(limit) }).toString();
  return request(`/sessions?${q}`, { method: 'GET' });
}

export async function getSessionById(id) {
  if (!id) throw new Error('ID de sesión requerido');
  return request(`/sessions/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function sendFollowup(id, pregunta) {
  if (!id) throw new Error('ID de sesión requerido');
  if (!pregunta || !pregunta.trim()) throw new Error('La pregunta es requerida');
  return request(`/sessions/${encodeURIComponent(id)}/followup`, {
    method: 'POST',
    body: JSON.stringify({ pregunta }),
  });
}

export async function deleteSession(id) {
  if (!id) throw new Error('ID de sesión requerido');
  return request(`/sessions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function generateImage(descripcion_sueno, estilo = 'arte digital vibrante') {
  if (!descripcion_sueno || !descripcion_sueno.trim()) throw new Error('La descripción del sueño es requerida');
  return request('/generate-image', {
    method: 'POST',
    body: JSON.stringify({ descripcion_sueno, estilo }),
  });
}

export const apiBase = BASE_URL;
