# FocusBoard UI

Frontend do FocusBoard, um sistema de gerenciamento de tarefas pessoais. Construído com Angular 22 e Angular Material.

> O backend está em [focusboard-api](https://github.com/swetonyancelmo/focusboard-api) (Spring Boot + JWT + PostgreSQL + Redis) e precisa estar rodando para o app funcionar.

---

## Tecnologias

| Ferramenta | Versão |
|---|---|
| Angular | 22.0.0 |
| Angular Material | 22.0.0 |
| TypeScript | 6.0.2 |
| RxJS | 7.8.0 |
| Vitest | (testes unitários) |

---

## Funcionalidades

- Autenticação com JWT (login, cadastro, logout)
- Renovação automática do access token via refresh token
- Rotas protegidas com AuthGuard
- Listagem de tarefas com paginação (12 por página)
- Criação, edição e exclusão de tarefas
- Chips coloridos por status e prioridade
- Dialog de confirmação antes de excluir
- Feedback visual com Snackbar
- Layout responsivo

---

## Como rodar

### Pré-requisitos

- Node.js instalado
- Backend `focusboard-api` rodando em `http://localhost:8080`

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
ng serve
```

Acesse `http://localhost:4200`. O app redireciona automaticamente para `/login`.

### Build de produção

```bash
ng build
```

Os artefatos ficam em `dist/`.

### Testes

```bash
ng test
```

---

## Estrutura de Pastas

```
src/app/
  core/
    guards/
      auth.guard.ts          # Bloqueia rotas sem token
    interceptors/
      auth.interceptor.ts    # Injeta Bearer token em toda requisição
    models/
      auth.model.ts          # Interfaces de autenticação
      task.model.ts          # Interfaces de tarefas
    services/
      auth.service.ts        # Login, logout, register, refresh token
      task.service.ts        # CRUD de tarefas
  features/
    auth/
      login/                 # Tela de login (/login)
      register/              # Tela de cadastro (/register)
    tasks/
      task-list/             # Lista de tarefas (/tasks)
      task-dialog/           # Dialog de criar/editar tarefa
  shared/
    confirm-dialog/          # Dialog de confirmação de exclusão
```

---

## Rotas

| Rota | Componente | Protegida |
|---|---|---|
| `/login` | LoginComponent | Não |
| `/register` | RegisterComponent | Não |
| `/tasks` | TaskListComponent | Sim (authGuard) |
| `/` | — | Redireciona para `/login` |

---

## Configuração da API

A URL base da API está em `src/environments/environment.ts`:

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080'
};
```
