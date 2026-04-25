// Configuración de conexión (Usa solo la URL base hasta .co)
const URL_PROYECTO = 'https://bkzvyoqdvxahwuakptwf.supabase.co'; 
const KEY_ANONIMA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZra3hrc3dnd2JlYW9yc3h1bXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzA5ODAsImV4cCI6MjA5MjcwNjk4MH0.dYS8r4qA-Kja7-pppLTtseJuzM1LHAvw5zU0-agB98Q';

// Evitamos el nombre "supabase" para que no choque con la librería global
const supabaseClient = supabase.createClient(URL_PROYECTO, KEY_ANONIMA);

// ─────────────────────────────────────────────────────────────
//  OPERACIONES DE BASE DE DATOS
// ─────────────────────────────────────────────────────────────

async function loadMessages() {
  const list = document.getElementById('messages-list');
  
  // Obtenemos los datos desde Supabase
  const { data, error } = await supabaseClient
    .from('tareas') // Asegúrate de que tu tabla se llame 'tareas' o cámbialo a 'mensajes'
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar:', error.message);
    return;
  }

  list.innerHTML = '';
  if (data.length === 0) {
    list.innerHTML = '<div class="empty-state"><span>🍗</span>Aún no hay mensajes.</div>';
  } else {
    data.forEach(entry => {
      // Adaptamos los nombres de las columnas de tu DB
      const item = {
        id: entry.id,
        name: entry.nombre || 'Anónimo', 
        text: entry.mensaje || entry.nombre, // Ajusta según tus columnas
        date: new Date(entry.created_at).toLocaleString('es-GT')
      };
      list.appendChild(createCard(item));
    });
  }
  updateCount(data.length);
}

async function submitMessage() {
  if (!validate()) return;

  const nameInput = document.getElementById('inp-name');
  const msgInput = document.getElementById('inp-msg');
  const btn = document.getElementById('btn-send');

  btn.disabled = true;
  btn.textContent = 'Enviando…';

  // Insertar en Supabase
  const { error } = await supabaseClient
    .from('tareas')
    .insert([
      { 
        nombre: nameInput.value.trim(), 
        // Si tu tabla tiene una columna 'mensaje', agrégala aquí:
        // mensaje: msgInput.value.trim() 
      }
    ]);

  if (error) {
    alert('Error al guardar en la base de datos: ' + error.message);
    btn.disabled = false;
    btn.textContent = '📮 Enviar Mensaje';
  } else {
    nameInput.value = '';
    msgInput.value = '';
    btn.disabled = false;
    btn.textContent = '📮 Enviar Mensaje';
    
    // Banner de éxito
    const banner = document.getElementById('success-banner');
    banner.classList.add('visible');
    setTimeout(() => banner.classList.remove('visible'), 3500);

    loadMessages(); // Recargar lista
  }
}

async function deleteMessage(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este mensaje?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from('tareas')
    .delete()
    .eq('id', id);

  if (error) {
    alert('No se pudo borrar: ' + error.message);
  } else {
    loadMessages();
  }
}

// ─────────────────────────────────────────────────────────────
//  FUNCIONES AUXILIARES (Se mantienen igual)
// ─────────────────────────────────────────────────────────────

function updateCount(n) {
  document.getElementById('msg-count').textContent =
    n === 0 ? 'Sin mensajes todavía' :
    n === 1 ? '1 mensaje publicado' : `${n} mensajes publicados`;
}

function createCard(entry) {
  const card = document.createElement('div');
  card.className = 'msg-card';
  card.innerHTML = `
    <div class="msg-header">
      <div class="avatar">${entry.name.charAt(0).toUpperCase()}</div>
      <span class="msg-name">${escHtml(entry.name)}</span>
      <span class="msg-date">${entry.date}</span>
      <button onclick="deleteMessage(${entry.id})" style="background:none; border:none; cursor:pointer;">❌</button>
    </div>
    <div class="msg-text">${escHtml(entry.text)}</div>
  `;
  return card;
}

function escHtml(str) {
  return str ? str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
}

// Iniciar al cargar la página
loadMessages();