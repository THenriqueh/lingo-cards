# Lingo Cards · App

App mobile do Lingo Cards, em **React Native + Expo (SDK 58)**.

| Requisito | Como foi atendido |
|---|---|
| Expo Router | Stack, abas nativas, telas modais e rotas protegidas (`Stack.Protected`) |
| Estado global | **Zustand**: sessão (persistida com `expo-secure-store`) e avisos |
| Back-end | **Axios** + **TanStack Query** consumindo a API Express em [`../api`](../api) |
| CRUD | Idiomas, Baralhos, Cartões e Sessões de estudo |
| Autenticação | Cadastro, login e logout (JWT) |
| UI Kit | **React Native Paper** (Material Design 3, tema escuro) |

## Rodando

```bash
npm install
npm run go          # abre no Expo Go
```

A URL da API fica em `src/config.ts`.
