// Base de dades local (en un projecte real usaries un servidor)
let baseDades = JSON.parse(localStorage.getItem('testResults')) || [];

const respostesCorrectes = ["162", "Pastanaga", "5", "8", "I9"];

// Funció per guardar a l'API online
async function guardarParticipantOnline(participant) {
  try {
    const response = await fetch('/api/participants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(participant)
    });
    
    if (response.ok) {
      console.log('Participant guardat online');
    } else {
      // Fallback a localStorage si falla l'API
      console.log('API no disponible, guardant localment');
      baseDades.push(participant);
      localStorage.setItem('testResults', JSON.stringify(baseDades));
    }
  } catch (error) {
    console.error('Error guardant participant:', error);
    // Fallback a localStorage
    baseDades.push(participant);
    localStorage.setItem('testResults', JSON.stringify(baseDades));
  }
}

// Funció per carregar dades de l'API online
async function carregarParticipantsOnline() {
  try {
    const response = await fetch('/api/participants');
    if (response.ok) {
      baseDades = await response.json();
    } else {
      // Fallback a localStorage
      baseDades = JSON.parse(localStorage.getItem('testResults')) || [];
    }
  } catch (error) {
    console.error('Error carregant participants:', error);
    baseDades = JSON.parse(localStorage.getItem('testResults')) || [];
  }
}

function començarTest() {
  const edat = document.getElementById('edat').value;
  const sexe = document.getElementById('sexe').value;
  const estudis = document.getElementById('estudis').value;
  
  if (!edat || !sexe || !estudis) {
    alert('Si us plau, omple tots els camps del formulari.');
    return;
  }
  
  // Guardar dades del participant
  window.participantActual = {
    edat: parseInt(edat),
    sexe: sexe,
    estudis: estudis,
    dataInici: new Date().toISOString(),
    respostes: []
  };
  
  // Mostrar test i amagar menú
  document.getElementById('menu-principal').style.display = 'none';
  document.getElementById('quiz').style.display = 'block';
  show(0);
}

function show(n) {
  document.querySelectorAll('.pregunta').forEach((q,i) => q.classList.toggle('activa', i===n));
}

function next(n) { 
  // Guardar resposta actual abans de continuar
  guardarRespostaActual();
  show(n); 
}

function prev(n) { 
  show(n-2); 
}

function guardarRespostaActual() {
  const preguntaActual = document.querySelector('.pregunta.activa');
  if (preguntaActual) {
    const inputSeleccionat = preguntaActual.querySelector('input[type="radio"]:checked');
    if (inputSeleccionat) {
      const numPregunta = inputSeleccionat.name.replace('p', '');
      window.participantActual.respostes[parseInt(numPregunta) - 1] = inputSeleccionat.value;
    }
  }
}

function finish() {
  // Guardar última resposta
  guardarRespostaActual();
  
  let correctes = 0;
  for (let i=1; i<=5; i++) {
    const val = document.querySelector('input[name="p'+i+'"]:checked');
    if (val && val.value === respostesCorrectes[i-1]) correctes++;
  }
  
  // Completar dades del participant
  window.participantActual.dataFi = new Date().toISOString();
  window.participantActual.puntuacio = correctes;
  window.participantActual.percentatge = (correctes / 5) * 100;
  
  // Guardar a la base de dades online (amb fallback local)
  guardarParticipantOnline(window.participantActual);
  
  // Mostrar resultats
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('resultats').style.display = 'block';
  document.getElementById('puntuacio').innerHTML = `
    <h3>Puntuació: ${correctes}/5 (${window.participantActual.percentatge.toFixed(1)}%)</h3>
    <p><strong>Dades del participant:</strong></p>
    <p>Edat: ${window.participantActual.edat} | Sexe: ${window.participantActual.sexe} | Estudis: ${window.participantActual.estudis}</p>
  `;
}

function restart() {
  document.querySelectorAll('input[type="radio"]').forEach(r=>r.checked=false);
  document.getElementById('menu-principal').style.display = 'block';
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('resultats').style.display = 'none';
  
  // Netejar formulari
  document.getElementById('formulari-dades').reset();
  window.participantActual = null;
}

// Funció per veure estadístiques (opcional)
function veureEstadistiques() {
  if (baseDades.length === 0) {
    alert('No hi ha dades disponibles encara.');
    return;
  }
  
  const totalParticipants = baseDades.length;
  const puntuacioMitjana = baseDades.reduce((sum, p) => sum + p.puntuacio, 0) / totalParticipants;
  
  console.log(`Total participants: ${totalParticipants}`);
  console.log(`Puntuació mitjana: ${puntuacioMitjana.toFixed(2)}/5`);
  console.log('Base de dades completa:', baseDades);
}

// Initialize - mostrar menú principal i carregar dades online
document.addEventListener('DOMContentLoaded', function() {
  // Carregar dades online (amb fallback local)
  carregarParticipantsOnline();
  
  document.getElementById('menu-principal').style.display = 'block';
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('resultats').style.display = 'none';
});
