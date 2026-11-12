import test from 'node:test';
import assert from 'node:assert/strict';
import { centesimosPorValor, ehTesouro, precoTitulo, textoTaxa, titulos } from '../src/lib/tesouro.js';
import { partesOperacao } from '../src/lib/comunidade.js';
import { precoAtivo, quantidadeAtivo } from '../src/lib/etf.js';

test('Tesouro: códigos, quantidade em centésimos e preço por título', () => {
  assert.ok(ehTesouro('SELIC2029') && ehTesouro('PRE2031') && ehTesouro('IPCA2035-08'));
  assert.ok(!ehTesouro('PETR4') && !ehTesouro('PRIO3') && !ehTesouro('IMAB11'));
  assert.equal(titulos(25), '0,25 título');
  assert.equal(titulos(150), '1,50 título');
  assert.equal(titulos(300), '3,00 títulos');
  assert.equal(precoTitulo(25.5), 2550);
  assert.equal(textoTaxa('selic', 0.06), 'Selic + 0,06% a.a.');
  assert.equal(textoTaxa('prefixado', 14.71), '14,71% a.a.');
  assert.equal(textoTaxa('ipca', 7.8), 'IPCA + 7,80% a.a.');
  assert.equal(centesimosPorValor(1000, 25.5), 39);
  assert.equal(centesimosPorValor(25.5, 25.5), 1);
  assert.equal(centesimosPorValor(20, 25.5), 0);
  assert.equal(quantidadeAtivo('IPCA2035', 39), '0,39 título');
  assert.equal(quantidadeAtivo('BOVA11', 3, true), '3 cotas');
  assert.equal(quantidadeAtivo('PETR4', 1), '1 ação');
  assert.equal(precoAtivo('IPCA2035', 25.5), 2550);
  assert.equal(precoAtivo('PETR4', 38.5), 38.5);
});

test('Tesouro na comunidade: "comprou 0,39 título de IPCA2035 a R$ 2.550,00 por título"', () => {
  const p = partesOperacao({ lado: 'compra', quantidade: 39, ativo: 'IPCA2035', preco: 25.5, origem: 'acao' });
  assert.equal(`${p.antes} ${p.ativo} ${p.depois}`.replace(/ /g, ' '), 'comprou 0,39 título de IPCA2035 a R$ 2.550,00 por título');
});
