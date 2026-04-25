// CONFIGURACIÓN (Asegúrate de que la URL termine solo en .co)
const URL_PROYECTO = 'https://fkkxkswgwbeaorsxumrc.supabase.co';
const KEY_ANONIMA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZra3hrc3dnd2JlYW9yc3h1bXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzA5ODAsImV4cCI6MjA5MjcwNjk4MH0.dYS8r4qA-Kja7-pppLTtseJuzM1LHAvw5zU0-agB98Q';

const supabaseClient = supabase.createClient(URL_PROYECTO, KEY_ANONIMA);

// CARGAR MENSAJES
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
      const card = document.createElement('div');
      card.className = 'msg-card';
      const fecha = new Date(entry.created_at).toLocaleString('es-GT');
      
      card.innerHTML = `
        <div class="msg-header">
          <div class="avatar">${entry.nombre.charAt(0).toUpperCase()}</div>
          <span class="msg-name">${escHtml(entry.nombre)}</span>
          <span class="msg-date">${fecha}</span>
          <button onclick="deleteMessage(${entry.id})" style="background:none; border:none; cursor:pointer;">❌</button>
        </div>
        <div class="msg-text">${escHtml(entry.mensaje)}</div>
      `;
      list.appendChild(card);
    });
  }
  document.getElementById('msg-count').textContent = `${data.length} mensajes publicados`;
}

// ENVIAR MENSAJE
async function submitMessage() {
  const nameInput = document.getElementById('inp-name');
  const msgInput = document.getElementById('inp-msg');
  const btn = document.getElementById('btn-send');

  if (!nameInput.value.trim() || !msgInput.value.trim()) {
    alert("¡Uy! Olvidaste poner tu nombre o tu mensaje 🍗");
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const { error } = await supabaseClient
    .from('tareas')
    .insert([{ 
      nombre: nameInput.value.trim(), 
      mensaje: msgInput.value.trim() 
    }]);

  if (error) {
    alert('Error: ' + error.message);
  } else {
    nameInput.value = '';
    msgInput.value = '';
    const banner = document.getElementById('success-banner');
    banner.classList.add('visible');
    setTimeout(() => banner.classList.remove('visible'), 3000);
    loadMessages();
  }
  btn.disabled = false;
  btn.textContent = '📮 Enviar Mensaje';
}

// BORRAR MENSAJE
async function deleteMessage(id) {
  if (!confirm("¿Borrar este comentario?")) return;
  const { error } = await supabaseClient.from('tareas').delete().eq('id', id);
  if (error) alert("Error al borrar");
  else loadMessages();
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadMessages();