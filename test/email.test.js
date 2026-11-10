import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sugerirEmail } from '../src/lib/email.js';

test('sugere a correção de domínios digitados errado', () => {
  assert.equal(sugerirEmail('tamanduabr3@gamil.com'), 'tamanduabr3@gmail.com');
  assert.equal(sugerirEmail('ana@gmail.con'), 'ana@gmail.com');
  assert.equal(sugerirEmail('ana@gmial.com'), 'ana@gmail.com');
  assert.equal(sugerirEmail('ana@hotmial.com'), 'ana@hotmail.com');
  assert.equal(sugerirEmail('ana@outlok.com'), 'ana@outlook.com');
  assert.equal(sugerirEmail('ana@yaho.com.br'), 'ana@yahoo.com.br');
  assert.equal(sugerirEmail('ana@isecensa.edu.bt'), 'ana@isecensa.edu.br');
});

test('não mexe em domínios certos ou desconhecidos', () => {
  for (const e of ['ana@gmail.com', 'ana@uol.com.br', 'ana@bol.com.br', 'jv_neder@id.uff.br', 'ana@empresa.com.br', 'ana@gmx.de', 'ana@x.io', 'sem-arroba'])
    assert.equal(sugerirEmail(e), null, e);
});
