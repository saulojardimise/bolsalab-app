import { test } from 'node:test';
import assert from 'node:assert/strict';
import { navegadorDeApp, plataforma, safariNovo } from '../src/lib/instalar.js';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const IPAD_NOVO = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

test('plataforma: iPhone, iPad (que se diz Mac), Android e PC', () => {
  assert.equal(plataforma(IPHONE, 5), 'ios');
  assert.equal(plataforma(IPAD_NOVO, 5), 'ios');
  assert.equal(plataforma(IPAD_NOVO, 0), 'pc');      // Mac de verdade
  assert.equal(plataforma(ANDROID, 5), 'android');
  assert.equal(plataforma(PC, 0), 'pc');
});

test('navegador de dentro do Instagram/WhatsApp não instala', () => {
  assert.equal(navegadorDeApp(IPHONE + ' Instagram 300.0'), true);
  assert.equal(navegadorDeApp(ANDROID + ' WhatsApp/2.24'), true);
  assert.equal(navegadorDeApp(IPHONE), false);
});

test('Safari do iOS 26 (Compartilhar dentro do menu) x versões antigas', () => {
  assert.equal(safariNovo(IPHONE), false);
  assert.equal(safariNovo('Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'), true);
});
