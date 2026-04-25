// CONFIGURACIÓN (Verifica que la URL termine en .co)
const URL_PROYECTO = 'https://fkkxkswgwbeaorsxumrc.supabase.co';
const KEY_ANONIMA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZra3hrc3dnd2JlYW9yc3h1bXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzA5ODAsImV4cCI6MjA5MjcwNjk4MH0.dYS8r4qA-Kja7-pppLTtseJuzM1LHAvw5zU0-agB98Q';

const supabaseClient = supabase.createClient(URL_PROYECTO, KEY_ANONIMA);

// 1. CARGAR MENSAJES (READ)
async function loadMessages() {
  const list = document.getElementById('messages-list');
  
  const { data, error } = await supabaseClient
    .from('tareas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar:', error.message);
    return;
  }

  list.innerHTML = '';
  if (data.length === 0) {
    list.innerHTML = '<div class="empty-state"><span>🍗</span>¡Sé el primero en comentar!</div>';
  } else {
    data.forEach(entry => {
      list.appendChild(createCard(entry));
    });
  }
  updateCount(data.length);
}

// 2. ENVIAR MENSAJE (CREATE)
async function submitMessage() {
  const nameInput = document.getElementById('inp-name');
  const msgInput = document.getElementById('inp-msg');
  const btn = document.getElementById('btn-send');

  if (!nameInput.value.trim() || !msgInput.value.trim()) {
    alert("¡Falta el nombre o el mensaje! 🍗");
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Cocinando tu mensaje...';

  const { error } = await supabaseClient
    .from('tareas')
    .insert([
      { 
        nombre: nameInput.value.trim(), 
        mensaje: msgInput.value.trim() 
      }
    ]);

  if (error) {
    alert('Error: ' + error.message);
  } else {
    nameInput.value = '';
    msgInput.value = '';
    
    // Animación de éxito
    const banner = document.getElementById('success-banner');
    banner.classList.add('visible');
    setTimeout(() => banner.classList.remove('visible'), 3000);
    
    loadMessages(); // Refrescar lista
  }
  btn.disabled = false;
  btn.textContent = '📮 Enviar Mensaje';
}

// 3. BORRAR MENSAJE (DELETE)
async function deleteMessage(id) {
  if (!confirm("¿Deseas eliminar este comentario?")) return;

  const { error } = await supabaseClient
    .from('tareas')
    .delete()
    .eq('id', id);

  if (error) alert("No se pudo borrar");
  else loadMessages();
}

// FUNCIONES DE APOYO
function createCard(entry) {
  const card = document.createElement('div');
  card.className = 'msg-card';
  const fecha = new Date(entry.created_at).toLocaleString('es-GT');
  
  card.innerHTML = `
    <div class="msg-header">
      <div class="avatar">${entry.nombre.charAt(0).toUpperCase()}</div>
      <span class="msg-name">${escHtml(entry.nombre)}</span>
      <span class="msg-date">${fecha}</span>
      <button onclick="deleteMessage(${entry.id})" style="background:none; border:none; cursor:pointer; font-size:12px;">❌</button>
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

loadMessages();