import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alternar, pontosDasRespostas } from '../src/lib/perfilInvestidor.js';

test('múltipla escolha: marca várias, "Nunca investi" é exclusiva', () => {
  let m = alternar([], 2, 1);          // renda fixa
  m = alternar(m, 3, 1);               // + fundos/ações
  assert.deepEqual(m, [2, 3]);
  assert.deepEqual(alternar(m, 1, 1), [1]);        // nunca investi apaga as outras
  assert.deepEqual(alternar([1], 4, 1), [4]);      // marcar outra apaga "nunca investi"
  assert.deepEqual(alternar([2, 3], 3, 1), [2]);   // desmarcar
});

test('pontos: na múltipla vale a mais arrojada marcada', () => {
  assert.deepEqual(pontosDasRespostas([1, 2, 3, 4, [2, 3], 1]), [1, 2, 3, 4, 3, 1]);
  assert.deepEqual(pontosDasRespostas([1, 1, 1, 1, [1], 1]), [1, 1, 1, 1, 1, 1]);
});
