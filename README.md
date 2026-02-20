# 🚀 TaskFlow

> Sistema de gerenciamento de tarefas com board Kanban, autenticação JWT e pipeline CI/CD completo.

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)

---

## 📋 Sobre o Projeto

O **TaskFlow** é uma aplicação fullstack de gerenciamento de tarefas inspirada em ferramentas como Trello e Jira. Ele permite que times organizem seu trabalho em **workspaces**, criando e gerenciando **tasks** em um board Kanban visual com três colunas: *A Fazer*, *Em Progresso* e *Concluído*.

O projeto foi construído com foco em boas práticas de mercado: arquitetura em camadas no backend, gerenciamento de estado global no frontend, testes automatizados e um pipeline de CI/CD que garante a qualidade do código a cada push.

---

## ✨ Funcionalidades

- **Autenticação completa** — cadastro, login e logout com JWT
- **Workspaces** — crie espaços de trabalho separados por projeto ou equipe
- **Board Kanban** — visualize e mova tasks entre as colunas A Fazer, Em Progresso e Concluído
- **Gestão de Tasks** — crie, edite e delete tarefas com título, descrição, prioridade e data de vencimento
- **Alerta de atraso** — tasks com data vencida exibem aviso visual em vermelho
- **Dashboard** — métricas agregadas por workspace
- **Rotas protegidas** — apenas usuários autenticados acessam a aplicação
- **Sessão persistida** — o login é mantido mesmo ao fechar e reabrir o browser

---

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Para que serve |
|---|---|---|
| **NestJS** | 10.x | Framework Node.js com arquitetura modular (Controllers, Services, Modules) |
| **TypeScript** | 5.x | Tipagem estática para JavaScript |
| **MongoDB** | 7.x | Banco de dados NoSQL orientado a documentos |
| **Mongoose** | 8.x | ODM — mapeia documentos do MongoDB para classes TypeScript |
| **JWT (JSON Web Token)** | — | Autenticação stateless via tokens assinados |
| **Passport.js** | — | Middleware de autenticação, integrado via `@nestjs/passport` |
| **bcryptjs** | — | Criptografia de senhas com hash + salt |
| **class-validator** | — | Validação de DTOs com decorators (`@IsEmail`, `@IsString`, etc.) |
| **class-transformer** | — | Transformação automática de tipos nos DTOs |

### Frontend
| Tecnologia | Versão | Para que serve |
|---|---|---|
| **React** | 19.x | Biblioteca para construção de interfaces |
| **TypeScript** | 5.x | Tipagem estática no frontend |
| **Redux Toolkit** | 2.x | Gerenciamento de estado global |
| **RTK Query** | — | Fetching, caching e sincronização de dados com a API |
| **React Router DOM** | 6.x | Navegação entre páginas com rotas protegidas |
| **Create React App** | 5.x | Boilerplate e toolchain do projeto |

### Infraestrutura e Testes
| Tecnologia | Para que serve |
|---|---|
| **Docker & Docker Compose** | Ambiente isolado para o MongoDB e Mongo Express |
| **Mongo Express** | Interface web para visualizar os dados no banco |
| **Jest** | Testes unitários no backend (NestJS) |
| **React Testing Library** | Testes de componente no frontend |
| **GitHub Actions** | Pipeline CI/CD — roda testes e build automaticamente a cada push |

---

## 📁 Estrutura do Projeto

```
taskflow/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
├── backend/
│   ├── src/
│   │   ├── auth/               # Módulo de autenticação (JWT, Strategy, Guards)
│   │   │   ├── dto/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── users/              # Módulo de usuários
│   │   │   ├── schemas/
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── workspaces/         # Módulo de workspaces
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   ├── workspaces.controller.ts
│   │   │   ├── workspaces.module.ts
│   │   │   └── workspaces.service.ts
│   │   ├── tasks/              # Módulo de tasks
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.module.ts
│   │   │   └── tasks.service.ts
│   │   ├── common/
│   │   │   ├── decorators/     # @CurrentUser
│   │   │   └── guards/         # JwtAuthGuard
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── store/
│   │   │   ├── api/            # RTK Query (tasksApi, workspacesApi)
│   │   │   ├── slices/         # authSlice
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts      # Hook centralizado de autenticação
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Dashboard/      # Lista de workspaces
│   │   │   └── Workspace/      # Board Kanban
│   │   ├── components/
│   │   │   └── TaskCard/
│   │   ├── App.tsx             # Rotas e PrivateRoute
│   │   └── index.tsx
│   └── package.json
└── docker-compose.yml
```

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org) v18 ou superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (precisa estar **rodando**)
- [Git](https://git-scm.com)

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/taskflow.git
cd taskflow
```

### 2. Suba o banco de dados com Docker

```bash
docker compose up -d
```

Aguarde alguns segundos. Acesse `http://localhost:8081` para confirmar que o Mongo Express está rodando.

### 3. Configure o Backend

Entre na pasta do backend:

```bash
cd backend
```

Crie o arquivo de variáveis de ambiente copiando o exemplo:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

> **Atenção:** abra o arquivo `.env` e revise as variáveis. Para rodar localmente as configurações padrão já funcionam.

Instale as dependências e inicie o servidor:

```bash
npm install
npm run start:dev
```

O backend estará disponível em `http://localhost:3001/api/v1`.

### 4. Configure o Frontend

Abra um **novo terminal** e entre na pasta do frontend:

```bash
cd frontend
npm install
npm start
```

O frontend abrirá automaticamente em `http://localhost:3000`.

### 5. Acesse a aplicação

Abra `http://localhost:3000` no browser, crie uma conta e comece a usar!

---

## 🧪 Rodando os Testes

### Backend

```bash
cd backend

# Roda todos os testes uma vez
npm run test

# Roda com relatório de cobertura
npm run test:cov

# Modo watch (re-roda ao salvar arquivos)
npm run test:watch
```

### Frontend

```bash
cd frontend

# Roda todos os testes uma vez
npm test -- --watchAll=false

# Com relatório de cobertura
npm test -- --watchAll=false --coverage
```

---

## 🔌 Endpoints da API

### Autenticação

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Cadastrar novo usuário | Pública |
| `POST` | `/api/v1/auth/login` | Login | Pública |
| `GET` | `/api/v1/auth/me` | Dados do usuário logado | JWT |

### Workspaces

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/v1/workspaces` | Criar workspace | JWT |
| `GET` | `/api/v1/workspaces` | Listar workspaces do usuário | JWT |
| `GET` | `/api/v1/workspaces/:id` | Detalhar workspace | JWT |

### Tasks

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/v1/tasks` | Criar task | JWT |
| `GET` | `/api/v1/tasks?workspace=ID` | Listar tasks do workspace | JWT |
| `PATCH` | `/api/v1/tasks/:id` | Atualizar task | JWT (só o criador) |
| `DELETE` | `/api/v1/tasks/:id` | Deletar task | JWT (só o criador) |
| `GET` | `/api/v1/tasks/dashboard/:id` | Métricas do workspace | JWT |

---

## 🔄 CI/CD

O projeto possui um pipeline automatizado com **GitHub Actions** configurado em `.github/workflows/ci.yml`.

**O que roda a cada push:**
1. Instala dependências com `npm ci`
2. Roda o lint no backend
3. Executa os testes unitários do backend com cobertura
4. Executa os testes de componente do frontend
5. Faz o build de produção do frontend

Backend e frontend são testados em **paralelo** em VMs Ubuntu separadas, economizando tempo.

**Proteção da branch `main`:** configurada para exigir que todos os checks passem antes de permitir merge de pull requests.

---

## 🗂️ Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` na pasta `backend/` e preencha:

```env
# Servidor
PORT=3001

# Banco de dados
MONGODB_URI=mongodb://admin:admin123@localhost:27017/taskflow?authSource=admin

# JWT
JWT_SECRET=coloque_uma_chave_longa_e_aleatoria_aqui
JWT_EXPIRES_IN=7d

# Frontend (para configuração de CORS)
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **Nunca suba o arquivo `.env` para o repositório.** Ele já está listado no `.gitignore`.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com 💜 durante o tutorial fullstack com Claude (Anthropic)</p>
