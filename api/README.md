# Lingo Cards API

API REST do **Lingo Cards**, app de flashcards para estudo de idiomas.
Feita com **Node.js + Express 5 + TypeScript**, **PostgreSQL** e **Drizzle ORM**, com autenticação **JWT**.

## Entidades e relacionamentos

| Entidade | Campos principais |
|---|---|
| Idioma | nome, código, bandeira |
| Baralho | título, descrição, nível (A1–C2) |
| Cartão | frente, verso, exemplo |
| Sessão de estudo | acertos, erros, duração |

- **Idioma 1 — N Baralho**
- **Baralho 1 — N Cartão** (e Baralho 1 — N Sessão de estudo)

Cada usuário só acessa os próprios dados. Excluir um idioma exclui seus baralhos, cartões e sessões (cascata).

## Rotas

Autenticação (públicas, exceto logout e me):

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/signup` | Cadastro: `{ nome, email, senha }` → `{ token, usuario }` |
| POST | `/auth/login` | Login: `{ email, senha }` → `{ token, usuario }` |
| POST | `/auth/logout` | Logout: invalida todos os tokens do usuário |
| GET | `/auth/me` | Dados do usuário logado |

CRUD (exigem `Authorization: Bearer <token>`), para `idiomas`, `baralhos`, `cartoes` e `sessoes`:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/<recurso>` | Lista (filtros: `/baralhos?idiomaId=`, `/cartoes?baralhoId=`, `/sessoes?baralhoId=`) |
| GET | `/<recurso>/:id` | Detalhe (baralho vem com idioma e cartões) |
| POST | `/<recurso>` | Cria |
| PUT | `/<recurso>/:id` | Atualiza (parcial) |
| DELETE | `/<recurso>/:id` | Exclui |

Extra: `GET /estatisticas` traz totais, minutos estudados, dias de estudo, taxa de acerto, revisões pendentes e cartões dominados.

### Repetição espaçada (SM-2)

Cada cartão guarda `facilidade`, `intervaloDias`, `repeticoes` e `proximaRevisao`. A cada resposta o app chama:

| Método | Rota | Corpo |
|---|---|---|
| POST | `/cartoes/:id/revisao` | `{ "nota": "errei" \| "dificil" \| "acertei" \| "facil" }` |

O servidor recalcula quando o cartão volta (`src/lib/repeticao.ts`): errou volta em 10 minutos; acertando, o intervalo cresce (1 dia, 6 dias, depois multiplicado pela facilidade).
`GET /cartoes?baralhoId=1&pendentes=true` lista só os cartões com revisão vencida, e cada baralho traz `paraRevisar`.

Erros sempre no formato `{ "erro": "mensagem", "detalhes"?: [...] }`.

## Rodando com Docker (recomendado)

Na raiz do repositório, sobe o PostgreSQL e a API juntos, sem instalar banco nem criar `.env`:

```bash
docker compose up --build      # API em http://localhost:3333
API_URL=http://localhost:3333 npm test --prefix api
```

## Rodando sem Docker

```bash
cp .env.example .env      # preencha DATABASE_URL e JWT_SECRET
npm install
npm run db:migrate        # cria as tabelas
npm run dev               # http://localhost:3333
npm test                  # teste ponta a ponta de todas as rotas (com a API rodando)
```

Para alterar o banco: edite `src/db/schema.ts` e rode `npm run db:generate` para gerar a nova migração.

## Deploy

`npm run build` compila para `dist/`, e `npm start` aplica as migrações pendentes e sobe o servidor.
Variáveis de ambiente necessárias: `DATABASE_URL` e `JWT_SECRET`.
