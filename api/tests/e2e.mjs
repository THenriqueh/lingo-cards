const B = process.env.API_URL ?? 'http://localhost:3333';
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };
async function req(metodo, rota, corpo, token) {
  const r = await fetch(B + rota, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const txt = await r.text();
  return { s: r.status, j: txt ? JSON.parse(txt) : null };
}
const email = `t${Date.now()}@x.com`;
console.log('AUTH');
let r = await req('POST', '/auth/signup', { nome: 'Thallis', email, senha: '123' });
ok(r.s === 400 && r.j.detalhes, 'signup rejeita senha curta (400)');
r = await req('POST', '/auth/signup', { nome: 'Thallis', email, senha: 'segredo1' });
ok(r.s === 201 && r.j.token && !r.j.usuario.senhaHash, 'signup 201, token, sem senha no retorno');
r = await req('POST', '/auth/signup', { nome: 'Xavier', email, senha: 'segredo1' });
ok(r.s === 409, 'signup duplicado 409');
r = await req('POST', '/auth/login', { email, senha: 'errada' });
ok(r.s === 401, 'login senha errada 401');
r = await req('POST', '/auth/login', { email: email.toUpperCase(), senha: 'segredo1' });
ok(r.s === 200 && r.j.token, 'login ok (e-mail sem diferenciar maiúsculas)');
const T = r.j.token;
ok((await req('GET', '/idiomas')).s === 401, 'rota protegida sem token 401');
ok((await req('GET', '/auth/me', null, T)).j.email === email, '/auth/me');

console.log('IDIOMAS');
r = await req('POST', '/idiomas', { nome: 'Alemão', codigo: 'DE', bandeira: '🇩🇪' }, T);
ok(r.s === 201 && r.j.codigo === 'de', 'cria idioma');
const idi = r.j.id;
ok((await req('GET', '/idiomas', null, T)).j.length === 1, 'lista idiomas');
r = await req('PUT', `/idiomas/${idi}`, { nome: 'Deutsch' }, T);
ok(r.s === 200 && r.j.nome === 'Deutsch', 'atualiza idioma');

console.log('BARALHOS (relacionamento Idioma 1-N Baralho)');
r = await req('POST', '/baralhos', { idiomaId: 999999, titulo: 'X' }, T);
ok(r.s === 400, 'rejeita idioma inexistente');
r = await req('POST', '/baralhos', { idiomaId: idi, titulo: 'Verbos', nivel: 'A1' }, T);
ok(r.s === 201, 'cria baralho');
const bar = r.j.id;
r = await req('POST', '/baralhos', { idiomaId: idi, titulo: 'Z', nivel: 'D9' }, T);
ok(r.s === 400, 'rejeita nível inválido');
r = await req('PUT', `/baralhos/${bar}`, { titulo: 'Verbos comuns', nivel: 'A2' }, T);
ok(r.s === 200 && r.j.nivel === 'A2', 'atualiza baralho');
r = await req('GET', `/baralhos?idiomaId=${idi}`, null, T);
ok(r.j.length === 1 && r.j[0].idioma.nome === 'Deutsch', 'filtra por idioma e inclui o idioma');

console.log('CARTÕES (relacionamento Baralho 1-N Cartão)');
r = await req('POST', '/cartoes', { baralhoId: bar, frente: 'sein', verso: 'ser/estar', exemplo: 'Ich bin müde.' }, T);
ok(r.s === 201, 'cria cartão');
const car = r.j.id;
await req('POST', '/cartoes', { baralhoId: bar, frente: 'haben', verso: 'ter' }, T);
r = await req('PUT', `/cartoes/${car}`, { verso: 'ser, estar' }, T);
ok(r.s === 200 && r.j.verso === 'ser, estar', 'atualiza cartão');
r = await req('GET', `/baralhos/${bar}`, null, T);
ok(r.j.totalCartoes === 2 && r.j.cartoes.length === 2, 'baralho traz seus cartões');
ok((await req('GET', `/cartoes?baralhoId=${bar}`, null, T)).j.length === 2, 'lista cartões do baralho');
r = await req('DELETE', `/cartoes/${car}`, null, T);
ok(r.s === 204, 'exclui cartão');
ok((await req('GET', `/cartoes/${car}`, null, T)).s === 404, 'cartão excluído some (404)');

console.log('SESSÕES');
r = await req('POST', '/sessoes', { baralhoId: bar, acertos: 8, erros: 2, duracaoSegundos: 95 }, T);
ok(r.s === 201, 'cria sessão');
const ses = r.j.id;
r = await req('PUT', `/sessoes/${ses}`, { acertos: 9, erros: 1 }, T);
ok(r.s === 200 && r.j.acertos === 9, 'atualiza sessão');
r = await req('GET', '/sessoes', null, T);
ok(r.j[0].baralho.titulo === 'Verbos comuns', 'lista sessões com o baralho');
r = await req('GET', '/estatisticas', null, T);
ok(r.j.totalCartoes === 1 && r.j.taxaAcerto === 90 && r.j.totalSessoes === 1, `estatísticas ${JSON.stringify(r.j)}`);

console.log('ISOLAMENTO ENTRE USUÁRIOS');
const T2 = (await req('POST', '/auth/signup', { nome: 'Outro', email: 'o' + email, senha: 'segredo2' })).j.token;
ok((await req('GET', `/baralhos/${bar}`, null, T2)).s === 404, 'outro usuário não vê meu baralho');
ok((await req('DELETE', `/idiomas/${idi}`, null, T2)).s === 404, 'outro usuário não apaga meu idioma');
ok((await req('POST', '/cartoes', { baralhoId: bar, frente: 'a', verso: 'b' }, T2)).s === 400, 'outro usuário não cria cartão no meu baralho');

console.log('EXCLUSÃO EM CASCATA');
ok((await req('DELETE', `/sessoes/${ses}`, null, T)).s === 204, 'exclui sessão');
ok((await req('DELETE', `/idiomas/${idi}`, null, T)).s === 204, 'exclui idioma');
ok((await req('GET', `/baralhos/${bar}`, null, T)).s === 404, 'baralho do idioma foi junto');

console.log('LOGOUT');
ok((await req('POST', '/auth/logout', null, T)).s === 204, 'logout 204');
ok((await req('GET', '/auth/me', null, T)).s === 401, 'token antigo não vale mais após logout');
ok((await req('GET', '/rota-que-nao-existe')).s === 404, '404 em rota inexistente');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTODOS OS TESTES PASSARAM');
process.exit(falhas ? 1 : 0);
