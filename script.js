let dict = {};

async function loadDict() {
  const res = await fetch("./data.json");
  dict = await res.json();
}

async function translateWord() {
  const word = document.getElementById("inputWord").value.toLowerCase().trim();

  const translation = dict[word];

  document.getElementById("output").value =
    translation && translation !== ""
      ? translation
      : "Aucune traduction trouvée.";
}

loadDict();
