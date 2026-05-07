const fs = require('fs');

const rawPresencas = `Às quatorze horas e cinquenta e seis minutos do dia cinco de maio de dois mil e vinte e seis, reuniu-se a Comissão de Administração e Serviço Público, no Plenário 8 do Anexo II da Câmara dos Deputados, com a PRESENÇA dos(as) Senhores(as) Deputados(as) Delegada Ione - Presidente;`;

const matchHoraAbertura = rawPresencas.match(/[\xC0\xE0Aa][s]?\s+(.+?)\s+do\s+dia/i);
let horaAberturaExt = 'XXX';
if (matchHoraAbertura) {
  horaAberturaExt = matchHoraAbertura[1].replace(/<[^>]+>/g, '').trim();
}
console.log('horaAberturaExt:', horaAberturaExt);

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

let tplPresencas = rawPresencas;
tplPresencas = tplPresencas.replace(new RegExp(escapeRegExp(horaAberturaExt), 'gi'), '{{horarioAbertura}}');

console.log('tplPresencas:', tplPresencas);
