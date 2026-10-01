# Strapi - Ambiente de teste

Projeto de teste para avaliar o **Strapi** como CMS, pensado em ser o mais próximo de um ambiente **real**: banco PostgreSQL e uma Landing Page em HTML, CSS e JavaScript puros, o conteúdo da página é editado no painel do Strapi.

> ⚠️ **Este é um ambiente de teste local.** As credenciais deste guia (usuário e senha `strapi`) são de desenvolvimento e **não devem ser usadas em servidores reais**.

---

## Sumário

1. [Como o projeto funciona](#1-como-o-projeto-funciona)
2. [O que você precisa instalar](#2-o-que-você-precisa-instalar)
3. [Estrutura do repositório](#3-estrutura-do-repositório)
4. [Instalação passo a passo](#4-instalação-passo-a-passo)
5. [Modelo de conteúdo no Strapi](#5-modelo-de-conteúdo-no-strapi)
6. [Uso no dia a dia](#6-uso-no-dia-a-dia)
7. [Trabalhando com Git](#8-trabalhando-com-git)
8. [Problemas comuns](#9-problemas-comuns)
9. [Segurança](#10-segurança)
10. [Referência rápida](#11-referência-rápida)

---

## 1. Como o projeto funciona

```
┌────────────────────┐      ┌────────────────────┐      ┌─────────────────────┐
│  Postgres          │◄─────│  Strapi (CMS)      │◄─────│  Site (HTML/CSS/JS) │
│  (Docker)          │      │  localhost:1337    │ API  │  localhost:3000     │
│  localhost:5432    │      │  painel + API REST │      │  busca o conteúdo   │
└────────────────────┘      └────────────────────┘      └─────────────────────┘
```

- **Postgres** é o banco de dados, guarda todo o conteúdo (textos, listas). Roda dentro de um container Docker.
- **Strapi** é o painel onde o conteúdo é editado.
- **Site** é uma página estática. O arquivo `cms.js` busca o conteúdo na API do Strapi e preenche os textos da página.
---

## 2. O que você precisa instalar

| Ferramenta | Para quê | Como conferir |
|---|---|---|
| **Git** | Clonar e versionar o repositório | `git --version` |
| **Node.js** | Rodar o Strapi e o servidor local do site | `node -v` e `npm -v` |
| **Docker Desktop** | Rodar o Postgres | `docker --version` |
| **Editor de código** (ex.: Cursor) | Editar arquivos | — |

### 2.1 Git

Baixe em <https://git-scm.com/downloads> e instale com as opções padrão.

### 2.2 Node.js

Baixe a versão em <https://nodejs.org>. Para saber qual versão o Strapi aceita, abra o arquivo `teste-creative/package.json` e veja o campo `engines` (por exemplo, `"node": ">=20.0.0 <=24.x.x"`). Use uma versão dentro dessa faixa.

### 2.3 Docker Desktop

1. Baixe em <https://www.docker.com/products/docker-desktop> e instale.
2. **Windows:** o Docker usa o **WSL 2**. Se o instalador pedir, aceite instalar/ativar. Se depois houver erro de WSL, abra o PowerShell **como administrador** e rode:
   ```powershell
   wsl --install
   wsl --update
   ```
   e reinicie o computador.
3. Abra o **Docker Desktop** e espere aparecer **"Engine running"** (em verde) no canto inferior esquerdo. O Docker Desktop precisa estar aberto sempre que for usar o projeto.

---

## 3. Estrutura do repositório

```
strapi-teste-creative/
├── docker-compose.yml        ← sobe o Postgres
├── .gitignore
├── README.md                 ← este arquivo
├── teste-creative/           ← projeto Strapi (painel + API)
│   ├── .env.example          ← modelo das variáveis (copiar para .env)
│   ├── config/               ← configurações (banco, middlewares...)
│   ├── src/                  ← content types e componentes (estrutura do conteúdo)
│   └── package.json
└── site/                     ← landing page
    ├── index.html
    ├── style.css
    ├── script.js             ← comportamento da página (menu etc.)
    ├── cms.js                ← busca e preenche o conteúdo do Strapi
```

**Arquivos que NÃO estão no repositório** (cada pessoa cria os seus, por segurança):

| Arquivo | O que tem | Como criar |
|---|---|---|
| `teste-creative/.env` | Senhas e chaves do Strapi | Passo 4.4 |

---

## 4. Instalação passo a passo

Os comandos abaixo usam **PowerShell (Windows)**. Em macOS/Linux os comandos são os mesmos, exceto onde indicado.

### 4.1 Clonar o repositório

Acesse o GitHub (é necessário ter uma conta), depois acesse o repositório, e clique em "Code", logo abaixo vai aparecer um endereço https, copie esse endereço;

<img width="284" alt="image" src="https://github.com/user-attachments/assets/7b23e775-5ac9-4fa0-a9e7-897d0a329b1d" />



> 💡 **Clone em uma pasta fora do OneDrive** (por exemplo, `C:\dev`). O OneDrive tenta sincronizar milhares de arquivos da pasta `node_modules` e deixa tudo lento ou causa erros de arquivo travado.

No terminal, digite os seguintes comandos:
```powershell
mkdir C:\dev
cd C:\dev
git clone <URL-DO-REPOSITORIO>
cd strapi-teste-creative
```

Troque `<URL-DO-REPOSITORIO>` pela URL do repositório (botão verde **Code** na página do GitHub, formato `https://github.com/usuario/strapi-teste-creative.git`). Na primeira vez, o Git abre uma janela do navegador para você entrar no GitHub.

### 4.2 Conferir o `docker-compose.yml`

O arquivo já está no repositório. Ele tem este conteúdo:

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: strapi
      POSTGRES_DB: strapi-teste-creative
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Estes três valores (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) **precisam ser iguais** aos do `.env` do Strapi (passo 4.4). Não altere nenhum deles.

### 4.3 Subir o Postgres

Com o Docker Desktop aberto ("Engine running"), na raiz do projeto:

```powershell
docker compose up -d
```

Na primeira vez ele baixa a imagem do Postgres (pode levar alguns minutos). Confira:

```powershell
docker compose ps
```

O serviço `db` deve aparecer como `running`. Para confirmar que o banco foi criado:

```powershell
docker compose exec db psql -U strapi -d postgres -c "\l"
```

A lista deve incluir `strapi-teste-creative`.

> ℹ️ A variável `POSTGRES_DB` só é lida **na primeira vez** que o volume é criado. Se o banco não aparecer na lista, veja [Problemas comuns](#9-problemas-comuns).

### 4.4 Configurar o `.env` do Strapi

O `.env` guarda as credenciais do banco e as chaves secretas do Strapi. Ele **não vai para o Git**, então você cria o seu.

**a) Copie o modelo:**

```powershell
cd teste-creative
Copy-Item .env.example .env
```
(macOS/Linux: `cp .env.example .env`)

Se o `.env.example` não existir, crie o arquivo `teste-creative/.env` manualmente com o conteúdo do item (c) abaixo.

**b) Gere as chaves secretas.**

O Strapi precisa de **9 valores aleatórios**: 4 para `APP_KEYS` e 1 para cada uma das outras 5 variáveis. Com o Node instalado, rode o comando abaixo **9 vezes** e guarde cada resultado:

```powershell
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

Cada pessoa deve gerar as **suas próprias** chaves. Não copie chaves de outra pessoa.

**c) Preencha o `.env`:**

```dotenv
# Server
HOST=0.0.0.0
PORT=1337

# Secrets (cole aqui os valores gerados no passo b)
APP_KEYS=VALOR1,VALOR2,VALOR3,VALOR4
API_TOKEN_SALT=VALOR5
ADMIN_JWT_SECRET=VALOR6
JWT_SECRET=VALOR7
TRANSFER_TOKEN_SALT=VALOR8
ENCRYPTION_KEY=VALOR9

# Database (devem bater com o docker-compose.yml)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi-teste-creative
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
DATABASE_SSL=false
DATABASE_FILENAME=
```

Pontos de atenção:

- `APP_KEYS` são 4 valores separados por vírgula, **sem espaços**.
- `DATABASE_SSL=false` é obrigatório. Com SSL ligado, o Strapi dá o erro `The server does not support SSL connections`, porque o Postgres do Docker não tem SSL.
- Não coloque aspas nos valores.

**Correspondência entre o Docker e o `.env`:**

| `docker-compose.yml` | `.env` | Valor |
|---|---|---|
| `POSTGRES_USER` | `DATABASE_USERNAME` | `strapi` |
| `POSTGRES_PASSWORD` | `DATABASE_PASSWORD` | `strapi` |
| `POSTGRES_DB` | `DATABASE_NAME` | `strapi-teste-creative` |
| `ports: "5432:5432"` | `DATABASE_HOST` / `DATABASE_PORT` | `localhost` / `5432` |

### 4.5 Instalar as dependências e iniciar o Strapi

Dentro de `teste-creative`:

```powershell
npm install
npm run develop
```

O `npm install` pode levar alguns minutos na primeira vez. O `npm run develop` compila o painel e sobe o Strapi. Quando terminar, o terminal mostra algo como `Server started` e o endereço `http://localhost:1337`.

**Deixe este terminal aberto** enquanto estiver usando o projeto.

### 4.6 Criar o usuário administrador

1. Abra <http://localhost:1337/admin>.
2. Na primeira vez, o Strapi pede para criar um administrador: nome, e-mail e senha.
3. Esse usuário existe **só no seu banco local**. Cada pessoa cria o seu.

### 4.7 Cadastrar e publicar o conteúdo

A estrutura do conteúdo (campos e componentes) já vem no código do repositório, então ao abrir o painel você já encontra o tipo **Landing Page 2** pronto, mas **vazio**.

Para preencher manualmente:

1. No menu lateral, clique em **Content Manager**.
2. Em "Single types", clique em **Landing Page 2**.
3. Preencha os campos (veja a [seção 5](#5-modelo-de-conteúdo-no-strapi)).
4. Na lista de teste, clique em **Add an entry** para cada item.
5. Clique em **Save** e depois em **Publish**.

> ⚠️ **Sem o Publish, a API não entrega o conteúdo.** Salvar não basta.

### 4.8 Gerar o token de acesso (API Token)

O site precisa de um token para ler a API. Cada pessoa gera o seu.

1. No painel do Strapi, clique em **Settings** (engrenagem, canto inferior esquerdo do menu).
2. Em **Global settings**, clique em **API Tokens**.
3. Clique em **Create new API Token**.
4. Preencha:
   - **Name:** `site-landing` (qualquer nome serve)
   - **Token duration:** `Unlimited` para o teste local (ou 30 dias, se preferir que expire)
   - **Token type:** **Read-only**
5. Clique em **Save**.
6. **Copie o token** que aparece (um texto longo). Ele costuma ser mostrado por completo só na criação. Se perder, abra o token e use **Regenerate**, que gera um valor novo (o antigo deixa de funcionar).


### 4.10 Rodar o site

Em um **segundo terminal** (o Strapi continua rodando no primeiro), dentro da pasta `site`:

```powershell
npx serve
```

Na primeira vez, o `npx` pergunta se pode instalar o pacote `serve`. Responda `y`. O terminal mostra o endereço, normalmente <http://localhost:3000>. Abra no navegador.

> Não abra o `index.html` com duplo clique. O navegador pode bloquear a busca dos dados. Use sempre um servidor local.

Alternativa: no Cursor, instale a extensão **Live Server**, clique com o botão direito no `index.html` e escolha **Open with Live Server** (endereço `http://127.0.0.1:5500`).

### 4.11 Testar se está funcionando

**Teste 1: a API responde?** No PowerShell (use `curl.exe`, com o `.exe`):

```powershell
curl.exe -H "Authorization: Bearer SEU_TOKEN" "http://localhost:1337/api/landing-page-2?populate=*"
```

Deve voltar um JSON com os títulos e a lista. Se não voltar, o problema está no Strapi ou no token, não no site.

**Teste 2: o site mostra o conteúdo do Strapi?**

1. Abra <http://localhost:3000>. O título, o subtítulo, o botão e os cartões devem vir do Strapi.
2. No painel, mude o título do hero para algo inconfundível, como `TESTE 123`.
3. Clique em **Save** e **Publish**.
4. Volte ao site e atualize com **Ctrl + F5**. O título deve ter mudado.

**Teste 3: a lista funciona?** Adicione um item novo na lista, publique e atualize o site: deve aparecer um cartão a mais. Remova o item, publique e atualize: ele deve sumir.

Se os três testes passaram, o ambiente está completo.

---

## 5. Modelo de conteúdo no Strapi

Tipo de conteúdo: **Landing Page 2** (*Single Type*). Endereço da API: `/api/landing-page-2`.

| Campo | Tipo | Onde aparece no site |
|---|---|---|
| `titulo_hero` | Short text | Título principal (`<h1>`) |
| `subtitulo_hero` | Short text / Long text | Texto abaixo do título |
| `texto_botao` | Short text | Texto do botão principal |
| `link_botao` | Short text | Link do botão principal |
| `beneficios` | Componente repetível | Cartões da seção de serviços |

Campos dentro de cada item de `teste`:

| Campo | Tipo | Onde aparece |
|---|---|---|
| `titulo` | Short text | Título do cartão (`<h3>`) |
| `descricao` | Long text | Texto do cartão (`<p>`) |

### Como o site liga os campos ao HTML

No `index.html`, os elementos recebem atributos que dizem qual campo do Strapi vai em cada lugar:

| Atributo | O que faz | Exemplo |
|---|---|---|
| `data-cms="campo"` | Troca o **texto** do elemento pelo valor do campo | `<h1 data-cms="titulo_hero">` |
| `data-cms-href="campo"` | Troca o **link** (`href`) pelo valor do campo | `<a data-cms-href="link_botao">` |
| `data-cms-list="campo"` | Marca um contêiner de **lista**: o primeiro filho é usado como molde e copiado uma vez por item | `<div class="services-grid" data-cms-list="beneficios">` |

Dentro de uma lista, o número do cartão (`01`, `02`...) é gerado automaticamente pela posição do item.

### Para adicionar um campo novo

1. No Strapi: **Content-Type Builder → Landing Page 2 → Add another field**. Salve e espere o Strapi reiniciar.
2. No `index.html`: adicione `data-cms="nome_do_campo"` no elemento.
3. No Strapi: preencha o campo e clique em **Publish**.

Não é necessário mexer no `cms.js`.

---

## 6. Uso no dia a dia

### Para começar a trabalhar

```powershell
# 1. Abra o Docker Desktop e espere "Engine running"

# 2. Terminal 1: Postgres + Strapi
cd C:\dev\strapi-teste-creative
docker compose up -d
cd teste-creative
npm run develop

# 3. Terminal 2: site
cd C:\dev\strapi-teste-creative\site
npx serve
```

- Painel do Strapi: <http://localhost:1337/admin>
- Site: <http://localhost:3000>

### Para parar

| O que fazer | Comando |
|---|---|
| Parar o Strapi ou o site | `Ctrl + C` no terminal correspondente |
| Parar o Postgres  | `docker compose stop` |
| Remover o container (**mantém** os dados no volume) | `docker compose down` |
| Remover o container **e apagar todos os dados** | `docker compose down -v` |

> ⚠️ O `-v` apaga o volume do banco. Todo o conteúdo cadastrado é perdido. Use só quando quiser recomeçar do zero.

### Depois de atualizar o repositório (`git pull`)

Se vierem mudanças no Strapi, reinstale as dependências e reinicie:

```powershell
cd teste-creative
npm install
npm run develop
```

---

## 8. Trabalhando com Git

### Rotina básica

```powershell
git pull                     # baixar as novidades antes de começar
git add .                    # adicionar as alterações
git status                   # conferir quais foram arquivos alterados
git commit -m "descrição do que mudou"
git push                     # envia as alterações para o repositório
```

### Nunca commite

| Arquivo/pasta | Motivo |
|---|---|
| `teste-creative/.env` | Senhas e chaves do Strapi |
| `site/config.js` | Token de acesso à API |
| `node_modules/` | Dependências (são reinstaladas com `npm install`) |
| `teste-creative/public/uploads/` | Arquivos enviados pelo painel |
| Backups (`*.tar.gz`) | Contêm dados do conteúdo |

Todos já estão no `.gitignore`. Mesmo assim, **rode `git status` antes de cada commit** e confira que nenhum deles aparece na lista. Para uma verificação extra:

```powershell
git ls-files | Select-String "\.env$|config\.js|node_modules"
```

Só devem aparecer arquivos de modelo (`.env.example`, `config.example.js`).

---

## 9. Problemas comuns

### Docker / Postgres

| Mensagem ou sintoma | Causa | Solução |
|---|---|---|
| `failed to connect to the docker API ... docker_engine` | Docker Desktop fechado ou ainda iniciando | Abra o Docker Desktop e espere "Engine running". Se não iniciar, rode `wsl --install` e `wsl --update` (PowerShell como administrador), reinicie e confira a virtualização na BIOS |
| `empty compose file` | `docker-compose.yml` vazio ou com outro nome (ex.: `docker-compose.yml.txt`) | Restaure com `git checkout -- docker-compose.yml`. Confira com `dir` se a extensão está correta |
| `database "strapi-teste-creative" does not exist` | O volume foi criado antes com outro nome de banco | `docker compose down -v` e depois `docker compose up -d` (apaga os dados locais) |
| `password authentication failed for user "strapi"` | Usuário ou senha do `.env` diferentes dos do volume antigo | Confira o `.env`. Se mudou algo no compose depois da primeira subida, use `docker compose down -v` e suba de novo |
| `port is already allocated` ou erro na porta 5432 | Outro Postgres usando a porta 5432 | Veja com `netstat -ano \| findstr :5432`. Pare o outro serviço, ou mude para `"5433:5432"` no compose e `DATABASE_PORT=5433` no `.env` (**não commite essa alteração**) |
| Nada responde após reiniciar o computador | Docker Desktop não iniciou sozinho | Abra o Docker Desktop e rode `docker compose up -d` |

### Strapi

| Mensagem ou sintoma | Causa | Solução |
|---|---|---|
| `The server does not support SSL connections` | SSL ligado na conexão com o banco | Coloque `DATABASE_SSL=false` no `.env`. Confira se não há variáveis `PGSSLMODE`, `DATABASE_URL` ou `DATABASE_SSL` definidas no Windows: `Get-ChildItem Env: \| Where-Object { $_.Name -like "PG*" -or $_.Name -like "DATABASE*" }`. Remova com `Remove-Item Env:NOME` |
| `ECONNREFUSED 127.0.0.1:5432` | Postgres não está rodando | `docker compose up -d` e `docker compose ps` |
| `Missing APP_KEYS` ou erro de chaves/secrets | `.env` incompleto ou não criado | Refaça o passo 4.4 (as 6 variáveis secretas precisam estar preenchidas) |
| `EADDRINUSE ... 1337` | Já existe um Strapi rodando | Feche o outro terminal, ou mude `PORT` no `.env` |
| Erros de versão do Node | Node fora da faixa aceita | Veja o campo `engines` do `teste-creative/package.json` e instale uma versão compatível |
| `npm.ps1 cannot be loaded because running scripts is disabled` | Política de execução do PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e abra um novo terminal |
| O tipo "Landing Page 2" não aparece | Estrutura não carregou | Confirme que rodou `npm install` e `npm run develop` dentro de `teste-creative`, na versão mais recente (`git pull`) |

### API e site

| Mensagem ou sintoma | Causa | Solução |
|---|---|---|
| Site mostra só o texto de reserva do HTML | O `cms.js` não conseguiu buscar o conteúdo | Aperte **F12 → Console** e veja a mensagem. Confira se o Strapi está rodando |
| `403` (Forbidden) | Token errado, expirado ou não é Read-only | Gere um novo token (passo 4.8) e atualize o `config.js` |
| `401` (Unauthorized) | Token ausente ou inválido | Confira se o `config.js` existe e se o `index.html` carrega `config.js` **antes** de `cms.js` |
| `404` (Not Found) | Conteúdo não publicado, ou endereço errado | Clique em **Publish** no Content Manager. Confira o endereço `/api/landing-page-2` |
| Erro `STRAPI_TOKEN is not defined` | `config.js` não existe ou não foi carregado | Faça o passo 4.9 e confira a ordem dos scripts no `index.html` |
| `Failed to fetch` ou erro de CORS | Strapi desligado, ou origem do site bloqueada | Confirme que <http://localhost:1337> abre. Se for CORS, veja a nota abaixo |
| Editei no Strapi e o site não mudou | Faltou **Publish**, ou cache do navegador | Publique e atualize com **Ctrl + F5** |
| O título troca, mas a lista não | O nome em `data-cms-list` difere do nome do campo no Strapi | Compare os dois nomes (devem ser idênticos) |
| Cartões criados, mas vazios | Nomes dos campos dentro da lista diferentes de `titulo` e `descricao` | Confira os nomes no componente |

**Nota sobre CORS:** por padrão o Strapi aceita qualquer origem. Se mesmo assim aparecer erro de CORS, abra `teste-creative/config/middlewares.ts` e troque o item `'strapi::cors'` por:

```ts
{
  name: 'strapi::cors',
  config: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
  },
},
```

### Git

| Mensagem ou sintoma | Causa | Solução |
|---|---|---|
| `rejected ... fetch first` no `git push` | Há novidades no repositório remoto | Rode `git pull` e depois `git push` |
| `.env` ou `config.js` aparece no `git status` | `.gitignore` não está funcionando | **Não commite.** Confira o `.gitignore` na raiz e peça ajuda |

---

## 10. Segurança

- As credenciais deste guia (`strapi` / `strapi`) são de **desenvolvimento local**. O banco só é acessível pelo seu computador.
- O `site/config.js` **é lido pelo navegador**, então qualquer pessoa que abrir a página consegue ver o token no código. Para teste local isso é aceitável: o token é **Read-only** e aponta para `localhost`.
- **Antes de publicar este site na internet**, resolva isso de uma destas formas:
  - liberar a leitura pública apenas do conteúdo da landing page (permissão `find` do papel *Public*, em Settings → Users & Permissions Plugin → Roles) e remover o token do site; ou
  - gerar o HTML já preenchido em uma etapa de build, sem o token no navegador.
- Se um token ou o `.env` for commitado por engano, **apagar o arquivo não basta**, porque o valor continua no histórico do Git. Trate o segredo como vazado: regenere o token (Settings → API Tokens → Regenerate) e gere novas chaves para o `.env`.
- Este repositório **não** deve conter: `.env`, `config.js` com token real, backups de dados, nem chaves de outros serviços.

---

## 11. Referência rápida

### Endereços e portas

| Serviço | Endereço |
|---|---|
| Painel do Strapi | <http://localhost:1337/admin> |
| API do Strapi | <http://localhost:1337/api/landing-page-2?populate=*> |
| Site (com `npx serve`) | <http://localhost:3000> |
| Postgres | `localhost:5432` |

### Credenciais do banco (somente ambiente de teste)

| Item | Valor |
|---|---|
| Usuário | `strapi` |
| Senha | `strapi` |
| Banco | `strapi-teste-creative` |
| Host / Porta | `localhost` / `5432` |
| SSL | desligado (`DATABASE_SSL=false`) |

### Comandos mais usados

| Objetivo | Comando | Pasta |
|---|---|---|
| Subir o Postgres | `docker compose up -d` | raiz |
| Ver se o Postgres está no ar | `docker compose ps` | raiz |
| Parar o Postgres | `docker compose stop` | raiz |
| Apagar banco e recomeçar | `docker compose down -v` | raiz |
| Instalar dependências | `npm install` | `teste-creative` |
| Rodar o Strapi | `npm run develop` | `teste-creative` |
| Rodar o site | `npx serve` | `site` |
| Testar a API | `curl.exe -H "Authorization: Bearer TOKEN" "http://localhost:1337/api/landing-page-2?populate=*"` | qualquer |

### Checklist de primeira instalação

- [ ] Git, Node.js e Docker Desktop instalados
- [ ] Repositório clonado (fora do OneDrive)
- [ ] Docker Desktop aberto ("Engine running") e `docker compose up -d` executado
- [ ] `teste-creative/.env` criado com chaves próprias e credenciais do banco
- [ ] `npm install` e `npm run develop` executados em `teste-creative`
- [ ] Administrador criado em <http://localhost:1337/admin>
- [ ] Conteúdo da Landing Page 2 preenchido e **publicado**
- [ ] API Token **Read-only** gerado
- [ ] Site rodando com `npx serve` e mostrando o conteúdo do Strapi
- [ ] Teste de edição no Strapi refletido no site (Ctrl + F5)
