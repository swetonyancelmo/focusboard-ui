# FocusBoard — Guia do Projeto

Frontend do FocusBoard, sistema de gerenciamento de tarefas pessoais. O usuário é iniciante em Angular — prefere explicações claras e soluções diretas.

---

## Visão Geral

O backend está pronto (Spring Boot + JWT + PostgreSQL + Redis). O frontend Angular já está **completamente implementado** e funcional.

- **Repositório da API:** https://github.com/swetonyancelmo/focusboard-api
- **URL base da API:** `http://localhost:8080`
- **Documentação Swagger:** `http://localhost:8080/swagger-ui.html`
- **Design Figma:** https://www.figma.com/design/hp3bY3F0ycMmZzSOti2wgy

---

## Stack

| Ferramenta | Detalhe |
|---|---|
| Framework | Angular 22 |
| UI Components | Angular Material 22 (tema Azure/Blue) |
| Estilo | SCSS |
| HTTP | Angular HttpClient |
| Change Detection | **Zoneless** (`provideZonelessChangeDetection()`) — usar Signals |
| Formulários | Reactive Forms (`FormBuilder`) |
| Testes | Vitest |

---

## O que já está implementado

Todas as telas e funcionalidades estão prontas:

- **Login** (`/login`) — formulário com validação, salva tokens no localStorage
- **Cadastro** (`/register`) — formulário com validação, redireciona para /login
- **Lista de Tarefas** (`/tasks`) — rota protegida, grid de cards, paginação
- **Dialog de Tarefa** — reutilizado para criar e editar
- **Dialog de Confirmação** — usado antes de excluir
- **Snackbar** — feedback visual em criar/editar/excluir
- **AuthGuard** — protege `/tasks`, redireciona para `/login` se sem token
- **AuthInterceptor** — injeta Bearer token em toda requisição, renova token 401

---

## Estrutura de Arquivos

```
src/
  styles.scss                        # Tema global + estilos dos chips
  environments/
    environment.ts                   # apiUrl: http://localhost:8080
  app/
    app.config.ts                    # providers: router, httpClient, interceptor, zoneless
    app.routes.ts                    # 4 rotas configuradas
    core/
      guards/
        auth.guard.ts                # CanActivateFn — verifica localStorage
      interceptors/
        auth.interceptor.ts          # HttpInterceptorFn — Bearer token + refresh 401
      models/
        auth.model.ts                # LoginRequest, RegisterRequest, AuthResponse, RegisterResponse
        task.model.ts                # Task, TaskPage, TaskStatus, TaskPriority, CreateTaskRequest, UpdateTaskRequest
      services/
        auth.service.ts              # login, register, logout, refreshToken, getAccessToken, isLoggedIn
        task.service.ts              # getTasks, createTask, updateTask, deleteTask
    features/
      auth/
        login/                       # login.component.ts/.html/.scss
        register/                    # register.component.ts/.html/.scss
      tasks/
        task-list/                   # task-list.component.ts/.html/.scss
        task-dialog/                 # task-dialog.component.ts + task.dialog.component.html + .scss
    shared/
      confirm-dialog/
        confirm-dialog.component.ts  # Inline template, sem arquivo HTML separado
```

> **Atenção:** o HTML do task-dialog se chama `task.dialog.component.html` (ponto, não hífen) — não renomear.

---

## Decisões de Implementação

### Zoneless + Signals
O app usa `provideZonelessChangeDetection()`. Isso significa que propriedades comuns (`isLoading = false`) **não atualizam a tela**. Todo estado mutável usa `signal()`:
```typescript
isLoading = signal(false);
tasks = signal<Task[]>([]);
```
Valores derivados usam `computed()`. No HTML, signals são lidos com `()`: `{{ isLoading() }}`.

### Interceptor de autenticação
Função (`HttpInterceptorFn`), não classe. Registrada via `withInterceptors([authInterceptor])` no `app.config.ts`. Fluxo:
1. Lê `accessToken` do localStorage
2. Rotas `/auth/login` e `/auth/register` passam sem token
3. Demais rotas recebem `Authorization: Bearer <token>`
4. Em erro 401 → chama `refreshToken()` → repete requisição com novo token
5. Se refresh falhar → limpa localStorage → navega para `/login`

### Chips coloridos
Os chips de status e prioridade recebem classes CSS dinâmicas no HTML:
```html
<mat-chip [class]="'status-' + task.status.toLowerCase()">
```
Os estilos ficam no **`styles.scss` global** (não no componente), usando o seletor `mat-chip.status-todo { background-color: ... }`. Isso é necessário porque o encapsulamento de estilos do Angular bloqueia o acesso aos elementos internos do `mat-chip`.

### Dialog reutilizável (TaskDialog)
Recebe `Task | null` via `MAT_DIALOG_DATA`. Se `null` → modo criação. Se `Task` → modo edição (pré-preenche o formulário). Usa `signal()` para o dado e `computed()` para o `isEditing`. Fecha com `dialogRef.close(formValue)` — quem abriu (`TaskListComponent`) chama a API.

### Tema Angular Material
Configurado em `styles.scss` com `mat.$azure-palette` como primary. O tema é M3 (Material Design 3). Para customizar chips, usar seletores `mat-chip.classe` no global styles — as variáveis CSS `--mdc-chip-*` não funcionam nesta versão.

---

## API Reference

### Autenticação

#### POST /auth/login
```json
// Request
{ "email": "string", "password": "string" }
// Response 200
{ "accessToken": "string", "refreshToken": "string" }
```

#### POST /auth/register
```json
// Request
{ "name": "string", "email": "string", "password": "string (6-20 chars)" }
// Response 201
{ "id": "uuid", "name": "string", "email": "string" }
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
Authorization: Bearer <token>
Response: 204 No Content
```

### Tarefas (exigem autenticação)

#### GET /tasks
```
Query: page (default 0), size (default 12), direction ("asc"|"desc")
Response 200: { content: Task[], totalElements, totalPages, size, number }
```

#### POST /tasks
```json
{ "title": "string", "description": "string", "status?": "TODO|IN_PROGRESS|DONE", "priority?": "LOW|MEDIUM|HIGH" }
```

#### PATCH /tasks/{id}
```json
// todos os campos opcionais
{ "title?": "string", "description?": "string", "status?": "...", "priority?": "..." }
```

#### DELETE /tasks/{id}
```
Response: 204 No Content
```

### TaskResponseDTO
```typescript
{ id: string; title: string; description: string; status: TaskStatus; priority: TaskPriority; userId: string; }
```

### Erro padrão
```typescript
{ timestamp: string; status: number; error: string; message: string; path: string; fields?: Record<string, string>; }
```

---

## Enums e Labels

```
Status:
  TODO        → "A Fazer"      → chip azul claro   (classe: status-todo)
  IN_PROGRESS → "Em Progresso" → chip âmbar         (classe: status-in_progress)
  DONE        → "Concluída"    → chip verde          (classe: status-done)

Prioridade:
  LOW    → "Baixa" → chip roxo claro   (classe: priority-low)
  MEDIUM → "Média" → chip laranja claro (classe: priority-medium)
  HIGH   → "Alta"  → chip vermelho claro (classe: priority-high)
```

---

## Regras de Negócio

- Access token expira em **15 minutos** — renovado automaticamente pelo interceptor
- Refresh token expira em **7 dias**
- Cada usuário acessa apenas suas próprias tarefas (garantido pelo backend)
- Logout chama `POST /auth/logout` e limpa os dois tokens do localStorage
- Senha: 6 a 20 caracteres (validação no frontend e backend)
