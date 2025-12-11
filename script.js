// simple front-side translator using data.json
let dict = {};
let reverse = {};

// load dictionary
async function loadDict() {
  try {
    const res = await fetch('./data.json');
    dict = await res.json();

    // build reverse mapping only if values non-empty and unique
    reverse = {};
    for (const [k,v] of Object.entries(dict)) {
      if (v && v.trim() !== '') reverse[v.toLowerCase()] = k;
    }

    document.getElementById('status').textContent = 'Dictionnaire chargé';
  } catch (e) {
    console.error(e);
    document.getElementById('status').textContent = 'Erreur de chargement de data.json';
  }
}

function normalize(s) {
  return (s||'').toLowerCase().trim();
}

async function translateWord() {
  const txt = document.getElementById('inputWord').value;
  const key = normalize(txt);

  // exact match first
  if (dict.hasOwnProperty(key) && dict[key].trim() !== '') {
    document.getElementById('output').value = dict[key];
    document.getElementById('status').textContent = 'Traduction trouvée';
    return;
  }

  // try word-by-word for multiword input (simple)
  const words = key.split(/\s+/).map(w => w.trim()).filter(Boolean);
  if (words.length > 1) {
    const translated = words.map(w => dict[w] && dict[w].trim() !== '' ? dict[w] : `[${w}]`).join(' ');
    document.getElementById('output').value = translated;
    document.getElementById('status').textContent = 'Traduction segmentée';
    return;
  }

  // reverse lookup (if user pasted MyLang -> french)
  if (reverse[key]) {
    document.getElementById('output').value = reverse[key];
    document.getElementById('status').textContent = 'Traduction inverse';
    return;
  }

  document.getElementById('output').value = 'Aucune traduction trouvée.';
  document.getElementById('status').textContent = 'Rien trouvé';
}

function clearInput() {
  document.getElementById('inputWord').value = '';
  document.getElementById('output').value = '';
  document.getElementById('status').textContent = 'Prêt';
}

function copyOutput() {
  const out = document.getElementById('output');
  out.select();
  out.setSelectionRange(0, 99999);
  navigator.clipboard?.writeText(out.value).then(()=> {
    document.getElementById('status').textContent = 'Copié';
  }).catch(()=> {
    document.getElementById('status').textContent = 'Impossible de copier';
  });
}

function swapPanels() {
  const input = document.getElementById('inputWord');
  const output = document.getElementById('output');
  const tmp = input.value;
  input.value = output.value;
  output.value = tmp;
  document.getElementById('status').textContent = 'Inversé';
}

// event binding
document.addEventListener('DOMContentLoaded', () => {
  loadDict();

  document.getElementById('translateBtn').addEventListener('click', translateWord);
  document.getElementById('clearBtn').addEventListener('click', clearInput);
  document.getElementById('copyBtn').addEventListener('click', copyOutput);
  document.getElementById('swapBtn').addEventListener('click', swapPanels);

  // allow pressing Enter+Ctrl to translate quickly
  document.getElementById('inputWord').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      translateWord();
    }
  });
});
