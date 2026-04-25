// CONFIGURACIÓN (Usa tus credenciales reales aquí)
const URL_PROYECTO = 'https://fkkxkswgwbeaorsxumrc.supabase.co';
const KEY_ANONIMA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZra3hrc3dnd2JlYW9yc3h1bXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzA5ODAsImV4cCI6MjA5MjcwNjk4MH0.dYS8r4qA-Kja7-pppLTtseJuzM1LHAvw5zU0-agB98Q';

const supabaseClient = supabase.createClient(URL_PROYECTO, KEY_ANONIMA);

// 1. CARGAR MENSAJES DESDE LA NUBE
async function loadMessages() {
  const list = document.getElementById('messages-list');
  
  const { data, error } = await supabaseClient
    .from('tareas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  list.innerHTML = '';
  if (data.length === 0) {
    list.innerHTML = '<div class="empty-state"><span>🍗</span>Aún no hay mensajes.</div>';
  } else {
    data.forEach(entry => {
      list.appendChild(createCard(entry));
    });
  }
  updateCount(data.length);
}

// 2. ENVIAR MENSAJE A SUPABASE
async function submitMessage() {
  const nameInput = document.getElementById('inp-name');
  const msgInput = document.getElementById('inp-msg');
  const btn = document.getElementById('btn-send');

  // Validación básica
  if (!nameInput.value.trim() || !msgInput.value.trim()) {
    alert("Por favor, llena ambos campos.");
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const { error } = await supabaseClient
    .from('tareas')
    .insert([
      { 
        nombre: nameInput.value.trim(), 
        mensaje: msgInput.value.trim() 
      }
    ]);

  if (error) {
    alert('Error al enviar: ' + error.message);
  } else {
    nameInput.value = '';
    msgInput.value = '';
    
    // Mostrar banner de éxito
    const banner = document.getElementById('success-banner');
    banner.classList.add('visible');
    setTimeout(() => banner.classList.remove('visible'), 3000);
    
    loadMessages(); // Refrescar lista
  }
  btn.disabled = false;
  btn.textContent = '📮 Enviar Mensaje';
}

// 3. BORRAR MENSAJE
async function deleteMessage(id) {
  if (!confirm("¿Deseas eliminar este comentario?")) return;

  const { error } = await supabaseClient
    .from('tareas')
    .delete()
    .eq('id', id);

  if (error) alert("Error al borrar");
  else loadMessages();
}

// ─────────────────────────────────────────────────────────────
// FUNCIONES DE DISEÑO (KFC Style)
// ─────────────────────────────────────────────────────────────

function createCard(entry) {
  const card = document.createElement('div');
  card.className = 'msg-card';
  const fechaLocal = new Date(entry.created_at).toLocaleString('es-GT');
  
  card.innerHTML = `
    <div class="msg-header">
      <div class="avatar">${entry.nombre.charAt(0).toUpperCase()}</div>
      <span class="msg-name">${escHtml(entry.nombre)}</span>
      <span class="msg-date">${fechaLocal}</span>
      <button onclick="deleteMessage(${entry.id})" class="btn-del">❌</button>
    </div>
    <div class="msg-text">${escHtml(entry.mensaje)}</div>
  `;
  return card;
}

function updateCount(n) {
  document.getElementById('msg-count').textContent = 
    n === 1 ? '1 mensaje publicado' : `${n} mensajes publicados`;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Cargar al inicio
loadMessages();