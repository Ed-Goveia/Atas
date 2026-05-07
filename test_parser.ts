import { processAtaText } from './src/lib/ataParser.js';
import { compileTextToPlain } from './src/lib/ataTemplate.js';
import * as fs from 'fs';

// Mock DOM
import { JSDOM } from 'jsdom';
const dom = new JSDOM();
global.document = dom.window.document;
global.Node = dom.window.Node;

const rawText = `Pauta - CASP - 05/05/2026 10:00
COMISSÃO DE ADMINISTRAÇÃO E SERVIÇO PÚBLICO

ATA DA 10ª REUNIÃO EXTRAORDINÁRIA
REALIZADA EM 5 DE MAIO DE 2026.
Às dez horas, reuniu-se com a PRESENÇA dos Deputados A, João da Silva - Presidente. ABERTURA: O Senhor Presidente declarou abertos os trabalhos. EXPEDIENTE: O Presidente informou que o expediente estava publicado. ORDEM DO DIA: A - Requerimentos. B - Proposições. C - Proposições Conclusivas. ENCERRAMENTO: Nada mais, o Presidente convocou e encerrou. E, para constar, eu _______ , Fulano de Tal, lavrei a presente Ata, que será assinada pelo Presidente, Deputado João da Silva ___________________, e publicada no Diário da Câmara.`;

try {
  processAtaText(rawText, 'deliberativa', (b, v) => {
     console.log('blocos', b);
     console.log('vars', v);
     console.log('compiled', compileTextToPlain(b.encerramento, v));
  });
} catch (e) {
  console.log('Uncaught', e);
}

