# FocusBoard — Guia do Projeto

Você está me ajudando a construir o **frontend** do FocusBoard, um sistema de gerenciamento de tarefas pessoais. Sou iniciante em Angular, então prefiro soluções simples e diretas, com explicações quando necessário.

---

## Visão Geral

O backend já está pronto (Spring Boot + JWT + PostgreSQL + Redis). Meu trabalho é construir o frontend Angular que consome essa API. O foco é aprender Angular fazendo um projeto real.

- **Repositório da API:** https://github.com/swetonyancelmo/focusboard-api
- **URL base da API:** `http://localhost:8080`
- **Documentação Swagger:** `http://localhost:8080/swagger-ui.html`

---

## Stack do Frontend

| Ferramenta | Versão / Detalhe |
|---|---|
| Framework | Angular (versão instalada no projeto) |
| UI Components | Angular Material |
| Estilo | Sass (SCSS) |
| HTTP | Angular HttpClient |
| Roteamento | Angular Router |
| SSR/SSG | **Não** — desativado na criação do projeto |

---

## Configurações já decididas

- **Tema Angular Material:** Indigo (`#3F51B5`) — cor primária já usada no design
- **Tipografia:** Roboto (padrão do Angular Material)
- **Aparência dos campos:** `appearance="outline"` (mat-form-field)
- **SSR:** Não habilitado (projeto client-side puro)
- **CSS pré-processador:** Sass (SCSS)

---

## API Reference

### Autenticação

Todos os endpoints de tarefa exigem o header:
```
Authorization: Bearer <access_token>
```

#### POST /auth/register
```json
// Request
{ "name": "string", "email": "string", "password": "string (6-20 chars)" }

// Response 201
{ "id": "uuid", "name": "string", "email": "string" }
```

#### POST /auth/login
```json
// Request
{ "email": "string", "password": "string" }

// Response 200
{ "accessToken": "string", "refreshToken": "string" }
```

#### POST /auth/refresh
```json
// Request
{ "refreshToken": "string" }

// Response 200
{ "accessToken": "string", "refreshToken": "string" }
```

#### POST /auth/logout
```
Authorization: Bearer <access_token>
Response: 204 No Content
```

---

### Tarefas (todas exigem autenticação)

#### GET /tasks
```
Query params:
  page      (default: 0)
  size      (default: 12)
  direction (default: "asc" | "desc") — ordena por título

Response 200:
{
  "content": [ TaskResponseDTO ],
  "totalElements": number,
  "totalPages": number,
  "size": number,
  "number": number
}
```

#### POST /tasks
```json
// Request
{
  "title": "string (obrigatório, max 255)",
  "description": "string (obrigatório)",
  "status": "TODO | IN_PROGRESS | DONE (opcional, default: TODO)",
  "priority": "LOW | MEDIUM | HIGH (opcional, default: MEDIUM)"
}
// Response 201: TaskResponseDTO
```

#### PATCH /tasks/{id}
```json
// Request (todos os campos opcionais)
{
  "title": "string (3-255)",
  "description": "string",
  "status": "TODO | IN_PROGRESS | DONE",
  "priority": "LOW | MEDIUM | HIGH"
}
// Response 200: TaskResponseDTO
```

#### DELETE /tasks/{id}
```
Response: 204 No Content
```

---

### TaskResponseDTO (modelo de tarefa)
```typescript
{
  id: string;          // UUID
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  userId: string;      // UUID
}
```

### Formato de erro padrão da API
```typescript
{
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fields?: Record<string, string>; // erros de validação por campo
}
```

---

## Telas Planejadas

O design já foi criado no Figma: https://www.figma.com/design/hp3bY3F0ycMmZzSOti2wgy

### 1. Login (`/login`)
- Campos: e-mail, senha
- Ação: POST /auth/login → salvar tokens → redirecionar para /tasks
- Link para a tela de cadastro

### 2. Cadastro (`/register`)
- Campos: nome, e-mail, senha
- Ação: POST /auth/register → redirecionar para /login
- Link para a tela de login

### 3. Lista de Tarefas (`/tasks`) — rota protegida
- Toolbar com nome do app e botão "Sair"
- Botão "+ Nova Tarefa" abre o dialog de criação
- Lista de cards com: título, descrição, chip de status, chip de prioridade, botões Editar e Excluir
- Paginação com mat-paginator (12 itens por página)

### 4. Dialog: Nova / Editar Tarefa
- Campos: título (input), descrição (textarea), status (select), prioridade (select)
- Reutilizar o mesmo dialog para criar e editar

---

## Estrutura de Pastas Sugerida

```
src/
  app/
    core/
      guards/
        auth.guard.ts          # redireciona para /login se não autenticado
      interceptors/
        auth.interceptor.ts    # adiciona o Bearer token em toda requisição
      services/
        auth.service.ts        # login, logout, register, refresh token
        task.service.ts        # CRUD de tarefas
      models/
        task.model.ts          # interfaces TypeScript
        auth.model.ts
    features/
      auth/
        login/
        register/
      tasks/
        task-list/
        task-dialog/
    shared/                    # componentes reutilizáveis, se necessário
```

---

## Regras de Negócio Importantes

- O **access token expira em 15 minutos** — implementar renovação automática via refresh token no interceptor
- O refresh token expira em **7 dias**
- Cada usuário só acessa **suas próprias tarefas** (garantido pelo backend)
- Ao fazer logout, chamar POST /auth/logout e limpar os tokens do armazenamento local
- Rotas protegidas devem usar um `AuthGuard` que verifica se o token existe

---

## Enums e Labels (para exibição nos chips e selects)

```typescript
// Status
TODO        → "A Fazer"       (chip azul claro)
IN_PROGRESS → "Em Progresso"  (chip âmbar)
DONE        → "Concluída"     (chip verde)

// Prioridade
LOW    → "Baixa"  (chip roxo claro)
MEDIUM → "Média"  (chip laranja claro)
HIGH   → "Alta"   (chip vermelho claro)
```

---

## Cores do Tema (Angular Material Indigo)

```scss
Primary:    #3F51B5  (Indigo 500)
Background: #FAFAFA
Surface:    #FFFFFF
Error:      #F44336
```
