import { test } from 'node:test';
import assert from 'node:assert/strict';
import { desdeOperacao, fraseOperacao, nomeCurto, resumoReacoes } from '../src/lib/comunidade.js';

test('frase da operação para ação e minicontrato', () => {
  assert.equal(fraseOperacao({ origem: 'acao', lado: 'compra', quantidade: 100, ativo: 'PETR4', preco: 30 }),
    'comprou 100 PETR4 a R$ 30,00');
  assert.equal(fraseOperacao({ origem: 'futuro', base: 'WIN', lado: 'venda', quantidade: 2, ativo: 'WINZ26', preco: 131005 }),
    'vendeu 2 contratos WINZ26 a 131.005 pts');
  assert.equal(fraseOperacao({ origem: 'futuro', base: 'WDO', lado: 'compra', quantidade: 1, ativo: 'WDOZ26', preco: 5432.5 }),
    'comprou 1 contrato WDOZ26 a 5.432,5 pts');
  assert.match(fraseOperacao({ origem: 'acao', lado: 'venda_descoberto', quantidade: 50, ativo: 'MGLU3', preco: 9.6 }), /^vendeu a descoberto 50 MGLU3/);
});

test('desde a operação: a favor de quem operou', () => {
  assert.equal(desdeOperacao({ lado: 'compra', preco: 30, preco_atual: 33 }), 10);
  assert.equal(desdeOperacao({ lado: 'venda_descoberto', preco: 30, preco_atual: 33 }), -10);
  assert.equal(desdeOperacao({ lado: 'venda', preco: 40, preco_atual: 30 }), 25);
  assert.equal(desdeOperacao({ lado: 'compra', preco: 30, preco_atual: null }), null);
});

test('reações e nome curto', () => {
  const r = resumoReacoes({ risada: 1, palmas: 3 });
  assert.equal(r.total, 4);
  assert.deepEqual(r.lista.map((x) => x.id), ['palmas', 'risada']);
  assert.equal(resumoReacoes(null).total, 0);
  assert.equal(nomeCurto('Bruno de Lima'), 'Bruno L.');
  assert.equal(nomeCurto('Ana'), 'Ana');
  assert.equal(nomeCurto(''), 'Aluno');
});

test('nomeCurto aguenta nome nulo (avisos do sistema não têm autor)', () => {
  assert.equal(nomeCurto(null), 'Aluno');
  assert.equal(nomeCurto(undefined), 'Aluno');
});
