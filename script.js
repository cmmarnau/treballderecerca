let baseDades = JSON.parse(localStorage.getItem('testResults')) || [];
const respostesCorrectes = ["162", "Pastanaga", "5", "8", "I9"];
const webAppURL = "https://script.google.com/macros/s/AKfycbwrkEcM1Z2JO2lbiYOAMDaKx0j543uijIUS9xsUGmKFa5LYJJFxJMEK3NId38j52ONk_A/exec"; // <-- Replace with your Web App URL

async function guardarParticipantOnline(participant) {
  try {
    const response = await fetch(webAppURL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(participant)
    });
    if(response.ok) {
      console.log('Participant guardat online');
    } else {
      throw new Error('POST failed');
    }
  } catch (err) {
    console.error('Error guardant participant:', err);
    // fallback localStorage
    baseDades.push(participant);
    localStorage.setItem('testResults', JSON.stringify(baseDades));
  }
}

async function carregarParticipantsOnline() {
  try {
    const response = await fetch(webAppURL);
    if(response.ok) {
      const result = await response.json();
      baseDades = result.data || [];
    } else {
      baseDades = JSON.parse(localStorage.getItem('testResults')) || [];
    }
  } catch (err) {
    console.error('Error carregant participants:', err);
    baseDades = JSON.parse(localStorage.getItem('testResults')) || [];
  }
}

function començarTest() {
  const edat = document.getElementById('edat').value;
  const sexe = document.getElementById('sexe').value;
  const estudis = document.getElementById('estudis').value;
  if(!edat || !sexe || !estudis) { alert('Si us plau, omple tots els camps'); return; }

  window.participantActual = { edat: parseInt(edat), sexe, estudis, dataInici: new Date().toISOString(), respostes: [] };
  document.getElementById('menu-principal').style.display='none';
  document.getElementById('quiz').style.display='block';
  show(0);
}

function show(n) { document.querySelectorAll('.pregunta').forEach((q,i)=>q.classList.toggle('activa', i===n)); }
function next(n){ guardarRespostaActual(); show(n); }
function prev(n){ show(n-2); }

function guardarRespostaActual() {
  const preguntaActual = document.querySelector('.pregunta.activa');
  if(preguntaActual){
    const sel = preguntaActual.querySelector('input[type="radio"]:checked');
    if(sel){
      const num = sel.name.replace('p','');
      window.participantActual.respostes[parseInt(num)-1] = sel.value;
    }
  }
}

async function finish() {
  guardarRespostaActual();
  let correctes = 0;
  for(let i=1;i<=5;i++){
    const val = document.querySelector(`input[name="p${i}"]:checked`);
    if(val && val.value===respostesCorrectes[i-1]) correctes++;
  }

  window.participantActual.dataFi = new Date().toISOString();
  window.participantActual.puntuacio = correctes;
  window.participantActual.percentatge = (correctes/5)*100;

  await guardarParticipantOnline(window.participantActual);

  document.getElementById('quiz').style.display='none';
  document.getElementById('resultats').style.display='block';
  document.getElementById('puntuacio').innerHTML = `
    <h3>Puntuació: ${correctes}/5 (${window.participantActual.percentatge.toFixed(1)}%)</h3>
    <p>Edat: ${window.participantActual.edat} | Sexe: ${window.participantActual.sexe} | Estudis: ${window.participantActual.estudis}</p>
  `;
}

function restart(){
  document.querySelectorAll('input[type="radio"]').forEach(r=>r.checked=false);
  document.getElementById('menu-principal').style.display='block';
  document.getElementById('quiz').style.display='none';
  document.getElementById('resultats').style.display='none';
  document.getElementById('formulari-dades').reset();
  window.participantActual=null;
}

document.addEventListener('DOMContentLoaded', carregarParticipantsOnline);


