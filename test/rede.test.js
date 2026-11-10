import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comErrosTraduzidos, ehErroDeRede, SEM_CONEXAO } from '../src/lib/rede.js';

test('reconhece erros de rede do Safari, Chrome e Firefox', () => {
  assert.equal(ehErroDeRede(new TypeError('Load failed')), true);
  assert.equal(ehErroDeRede({ message: 'TypeError: Failed to fetch' }), true);
  assert.equal(ehErroDeRede(new Error('NetworkError when attempting to fetch resource.')), true);
  assert.equal(ehErroDeRede(new Error('Saldo insuficiente')), false);
});

test('a API traduz o erro de rede e mantém os outros', async () => {
  const api = comErrosTraduzidos({
    a: async () => { throw new TypeError('Load failed'); },
    b: async () => { throw new Error('Saldo insuficiente'); },
    c: () => 42, modoDemo: true,
  });
  await assert.rejects(api.a(), (e) => e.message === SEM_CONEXAO && e.semConexao === true);
  await assert.rejects(api.b(), /Saldo insuficiente/);
  assert.equal(api.c(), 42);
  assert.equal(api.modoDemo, true);
});
