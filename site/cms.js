const STRAPI_URL = "http://localhost:1337";
const STRAPI_TOKEN = "COLE_O_TOKEN_AQUI";

// Preenche textos (data-cms) e links (data-cms-href) dentro de "raiz"
// usando os campos de "dados". Em itens de lista, campo vazio limpa o molde.
function preencher(raiz, dados, limpar = false) {
  raiz.querySelectorAll("[data-cms]").forEach((el) => {
    if (raiz === document && el.closest("[data-cms-list]")) return;
    const valor = dados[el.dataset.cms];
    if (valor) el.textContent = valor;
    else if (limpar) el.textContent = "";
  });

  raiz.querySelectorAll("[data-cms-href]").forEach((el) => {
    if (raiz === document && el.closest("[data-cms-list]")) return;
    const valor = dados[el.dataset.cmsHref];
    if (valor) el.href = valor;
  });
}

// Usa o primeiro filho como molde e cria uma cópia para cada item
function preencherLista(container, itens) {
  if (!itens || !itens.length) return;

  const molde = container.firstElementChild;
  if (!molde) return;

  container.innerHTML = "";

  itens.forEach((item, i) => {
    const copia = molde.cloneNode(true);
    preencher(copia, item, true);

    const numero = copia.querySelector(".service-number");
    if (numero) numero.textContent = String(i + 1).padStart(2, "0");

    // Mantém o destaque visual no 2º cartão, como no layout original
    copia.classList.toggle("featured", i === 1);

    container.appendChild(copia);
  });
}

async function carregarConteudo() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/landing-page-2?populate=*`, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    });
    if (!res.ok) throw new Error(`Erro ${res.status}`);

    const { data } = await res.json();

    // Textos e links soltos (hero)
    preencher(document, data);

    // Listas
    document.querySelectorAll("[data-cms-list]").forEach((container) => {
      preencherLista(container, data[container.dataset.cmsList]);
    });
  } catch (erro) {
    console.error("Não foi possível carregar o Strapi. Mantendo o conteúdo do HTML.", erro);
  }
}

carregarConteudo();