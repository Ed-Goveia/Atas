export const getOrdinal = (numStr: string, format = 'extenso') => {
  const cleanNum = numStr.replace(/\D/g, '');
  if (format === 'numero') return cleanNum;
  if (format === 'ordinal') return cleanNum + 'ª';

  const ordinals: { [key: string]: string } = {
    '1': 'primeira', '2': 'segunda', '3': 'terceira', '4': 'quarta', '5': 'quinta',
    '6': 'sexta', '7': 'sétima', '8': 'oitava', '9': 'nona', '10': 'décima',
    '11': 'décima primeira', '12': 'décima segunda', '13': 'décima terceira',
    '14': 'décima quarta', '15': 'décima quinta', '16': 'décima sexta',
    '17': 'décima sétima', '18': 'décima oitava', '19': 'décima nona', '20': 'vigésima'
  };
  return ordinals[cleanNum] || cleanNum + 'ª';
};

const formatText = (text: string, format: string) => {
  if (!text) return "";
  if (format === 'maiusculo') return text.toUpperCase();
  if (format === 'capitalizado') return text.replace(/\b\w/g, c => c.toUpperCase());
  return text;
};

const formatHorario = (horario: string, format: string) => {
  if (!horario || horario === 'XXX') return horario;
  if (format === 'extenso') {
     // A very basic mapper for exact hour
     const match = horario.match(/(\d{1,2})\s*(?:h|:|horas)(?:\s*(?:e\s*)?(\d{1,2}))?/i);
     if (match) {
        const nums: any = { '00': 'zero', '01': 'uma', '02': 'duas', '03': 'três', '04': 'quatro', '05': 'cinco', '06': 'seis', '07': 'sete', '08': 'oito', '09': 'nove', '1': 'uma', '2': 'duas', '3': 'três', '4': 'quatro', '5': 'cinco', '6': 'seis', '7': 'sete', '8': 'oito', '9': 'nove', '10': 'dez', '11': 'onze', '12': 'doze', '13': 'treze', '14': 'quatorze', '15': 'quinze', '16': 'dezesseis', '17': 'dezessete', '18': 'dezoito', '19': 'dezenove', '20': 'vinte', '30': 'trinta' }; // simplified
        const h = match[1].padStart(2, '0');
        const m = match[2];
        let res = nums[h] ? `${nums[h]} horas` : `${h} horas`;
        if (m && m !== '00') {
           res += nums[m] ? ` e ${nums[m]} minutos` : ` e ${m} minutos`;
        }
        return res;
     }
  }
  return horario;
};

const getPronomeDeputado = (genero: string, format: string) => {
  const isFem = genero === 'f';
  if (format === 'maiusculo') return isFem ? 'DEPUTADA' : 'DEPUTADO';
  if (format === 'minusculo') return isFem ? 'deputada' : 'deputado';
  if (format === 'abreviado') return 'Dep.';
  // Default capitalizado
  return isFem ? 'Deputada' : 'Deputado';
};

export const compileTextToHtml = (tpl: string, vars: any) => {
  if (!tpl) return "";
  vars = vars || {};
  let res = tpl;
  const config = vars.config || {};
  
  let displayAtaNum = vars.ataNum || 'XXX';
  let cleanAtaNum = displayAtaNum.replace(/<\/?[^>]+(>|$)/g, "").trim();
  if (/^\d+(ª|º|a|o)?$/.test(cleanAtaNum)) displayAtaNum = getOrdinal(cleanAtaNum, config.ataNum || 'ordinal');

  let displayAtaData = vars.ataData || 'XXX';
  let cleanAtaData = displayAtaData.replace(/<\/?[^>]+(>|$)/g, "").trim();
  if (cleanAtaData && cleanAtaData.toUpperCase() !== 'XXX') {
     const iso = converterTextoParaDataIso(cleanAtaData);
     if (iso) {
       displayAtaData = config.ataData === 'numerico' 
         ? iso.split('-').reverse().join('/') 
         : formatarDataBR(iso);
     }
  }

  const presName = formatText(vars.nomePresidente || 'NOME', config.nomePresidente || 'normal');
  const secName = formatText(vars.nomeSecretario || 'NOME', config.nomeSecretario || 'normal');
  const dispHorario = formatHorario(vars.horario || 'XXX', config.horario || 'numero');

  const useSuplente = vars.suplentePresidiu;
  const presAbertura = useSuplente ? (vars.nomePresidenteExercicio || 'NOME') : presName;
  const genAbertura = useSuplente ? vars.generoPresidenteExercicio : vars.genero;

  const spanGen = `<span contenteditable="false" class="bg-green-100/60 text-green-700 px-1 rounded font-bold cursor-default select-none shadow-sm"`;

  // Quando é titular, usamos a variável normal de presidência (ou omitimos).
  // Quando é suplente, usamos variáveis exclusivas do suplente.
  const htmlSuffixComNome = useSuplente 
    ? `, ${spanGen} data-var="gen_dep_exerc">${getPronomeDeputado(genAbertura, config.pronomeDeputado)}</span> <span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomePresidenteExercicio">${presAbertura}</span>`
    : `, ${spanGen} data-var="gen_dep">${getPronomeDeputado(vars.genero, config.pronomeDeputado)}</span> <span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomePresidente">${presName}</span>`;

  const htmlSuffixSemNome = useSuplente
    ? `, ${spanGen} data-var="gen_dep_exerc">${getPronomeDeputado(genAbertura, config.pronomeDeputado)}</span> <span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomePresidenteExercicio">${presAbertura}</span>`
    : ``; // Titular omite se não existia no texto original

  res = res.replace(/{{suffix_abertura_com_nome}}/g, htmlSuffixComNome);
  res = res.replace(/{{suffix_abertura_sem_nome}}/g, htmlSuffixSemNome);

  // O título só ganha bolha se for suplente (Presidente em exercício)
  if (useSuplente) {
    res = res.replace(/{{tituloPresidenteAbertura}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="tituloPresidenteAbertura">Presidente em exercício</span>`);
  } else {
    res = res.replace(/{{tituloPresidenteAbertura}}/g, `Presidente`);
  }

  res = res.replace(/{{nomePresidenteAbertura}}/g, useSuplente ? `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomePresidenteExercicio">${presAbertura}</span>` : `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomePresidente">${presName}</span>`);
  res = res.replace(/{{nomePresidente}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomePresidente">${presName}</span>`);
  res = res.replace(/{{nomePresidenteExercicio}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomePresidenteExercicio">${vars.nomePresidenteExercicio || 'NOME'}</span>`);
  res = res.replace(/{{numRequerimento}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="numRequerimento">${vars.numRequerimento || 'NÚMERO'}</span>`);
  res = res.replace(/{{temaDebate}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="temaDebate">${vars.temaDebate || 'TEMA'}</span>`);
  res = res.replace(/{{nomeSecretario}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="nomeSecretario">${secName}</span>`);
  res = res.replace(/{{ataNum}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="ataNum">${displayAtaNum}</span>`);
  res = res.replace(/{{ataData}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="ataData">${displayAtaData}</span>`);
  res = res.replace(/{{horario}}/g, `<span contenteditable="false" class="bg-blue-50 text-blue-700 px-1 rounded font-bold cursor-default select-none shadow-sm" data-var="horario">${dispHorario}</span>`);
  
  res = res.replace(/{{gen_senhor}}/g, `${spanGen} data-var="gen_senhor">${vars.genero === 'f' ? 'a senhora' : 'o senhor'}</span>`);
  res = res.replace(/{{gen_o}}/g, `${spanGen} data-var="gen_o">${vars.genero === 'f' ? 'a' : 'o'}</span>`);
  res = res.replace(/{{gen_a_pres_exerc}}/g, `${spanGen} data-var="gen_a_pres_exerc">${vars.generoPresidenteExercicio === 'f' ? 'a' : 'o'}</span>`);
  res = res.replace(/{{gen_O}}/g, `${spanGen} data-var="gen_O">${vars.genero === 'f' ? 'A' : 'O'}</span>`);
  res = res.replace(/{{gen_pelo}}/g, `${spanGen} data-var="gen_pelo">${vars.genero === 'f' ? 'pela' : 'pelo'}</span>`);
  res = res.replace(/{{gen_dep}}/g, `${spanGen} data-var="gen_dep">${getPronomeDeputado(vars.genero, config.pronomeDeputado)}</span>`);
  res = res.replace(/{{gen_dep_exerc}}/g, `${spanGen} data-var="gen_dep_exerc">${getPronomeDeputado(vars.generoPresidenteExercicio, config.pronomeDeputado)}</span>`);
  res = res.replace(/{{gen_dep_l}}/g, `${spanGen} data-var="gen_dep_l">${vars.genero === 'f' ? 'deputada' : 'deputado'}</span>`);

  res = res.replace(/{{gen_senhor_abertura}}/g, `${spanGen} data-var="gen_senhor_abertura">${genAbertura === 'f' ? 'a senhora' : 'o senhor'}</span>`);
  res = res.replace(/{{gen_o_abertura}}/g, `${spanGen} data-var="gen_o_abertura">${genAbertura === 'f' ? 'a' : 'o'}</span>`);
  res = res.replace(/{{gen_O_abertura}}/g, `${spanGen} data-var="gen_O_abertura">${genAbertura === 'f' ? 'A' : 'O'}</span>`);
  res = res.replace(/{{gen_pelo_abertura}}/g, `${spanGen} data-var="gen_pelo_abertura">${genAbertura === 'f' ? 'pela' : 'pelo'}</span>`);
  res = res.replace(/{{gen_dep_abertura}}/g, `${spanGen} data-var="gen_dep_abertura">${getPronomeDeputado(genAbertura, config.pronomeDeputado)}</span>`);

  return res;
};

export const compileTextToPlain = (tpl: string, vars: any) => {
  if (!tpl) return "";
  vars = vars || {};
  let res = tpl;
  const config = vars.config || {};
  
  let displayAtaNum = vars.ataNum || 'XXX';
  let cleanAtaNum = displayAtaNum.replace(/<\/?[^>]+(>|$)/g, "").trim();
  if (/^\d+(ª|º|a|o)?$/.test(cleanAtaNum)) displayAtaNum = getOrdinal(cleanAtaNum, config.ataNum || 'ordinal');

  let displayAtaData = vars.ataData || 'XXX';
  let cleanAtaData = displayAtaData.replace(/<\/?[^>]+(>|$)/g, "").trim();
  if (cleanAtaData && cleanAtaData.toUpperCase() !== 'XXX') {
     const iso = converterTextoParaDataIso(cleanAtaData);
     if (iso) displayAtaData = config.ataData === 'numerico' ? iso.split('-').reverse().join('/') : formatarDataBR(iso);
  }

  const presName = formatText(vars.nomePresidente || 'NOME', config.nomePresidente || 'normal');
  const secName = formatText(vars.nomeSecretario || 'NOME', config.nomeSecretario || 'normal');
  const dispHorario = formatHorario(vars.horario || 'XXX', config.horario || 'numero');

  const useSuplente = vars.suplentePresidiu;
  const presAbertura = useSuplente ? (vars.nomePresidenteExercicio || 'NOME') : presName;
  const genAbertura = useSuplente ? vars.generoPresidenteExercicio : vars.genero;
  const tituloPresAbertura = useSuplente ? 'Presidente em exercício' : 'Presidente';

  const plainSuffixComNome = useSuplente 
    ? `, ${genAbertura === 'f' ? 'Deputada' : 'Deputado'} ${presAbertura}`
    : `, ${vars.genero === 'f' ? 'Deputada' : 'Deputado'} ${presName}`;

  const plainSuffixSemNome = useSuplente
    ? `, ${genAbertura === 'f' ? 'Deputada' : 'Deputado'} ${presAbertura}`
    : ``; // If it's the titular and it wasn't there originally, omit it!

  res = res.replace(/{{suffix_abertura_com_nome}}/g, plainSuffixComNome);
  res = res.replace(/{{suffix_abertura_sem_nome}}/g, plainSuffixSemNome);

  res = res.replace(/{{tituloPresidenteAbertura}}/g, tituloPresAbertura);
  res = res.replace(/{{nomePresidenteAbertura}}/g, presAbertura);
  res = res.replace(/{{nomePresidente}}/g, presName);
  res = res.replace(/{{nomePresidenteExercicio}}/g, vars.nomePresidenteExercicio || '');
  res = res.replace(/{{numRequerimento}}/g, vars.numRequerimento || '');
  res = res.replace(/{{temaDebate}}/g, vars.temaDebate || '');
  res = res.replace(/{{nomeSecretario}}/g, secName);
  res = res.replace(/{{ataNum}}/g, displayAtaNum);
  res = res.replace(/{{ataData}}/g, displayAtaData);
  res = res.replace(/{{horario}}/g, dispHorario);
  res = res.replace(/{{gen_senhor}}/g, vars.genero === 'f' ? 'a senhora' : 'o senhor');
  res = res.replace(/{{gen_o}}/g, vars.genero === 'f' ? 'a' : 'o');
  res = res.replace(/{{gen_a_pres_exerc}}/g, vars.generoPresidenteExercicio === 'f' ? 'a' : 'o');
  res = res.replace(/{{gen_O}}/g, vars.genero === 'f' ? 'A' : 'O');
  res = res.replace(/{{gen_pelo}}/g, vars.genero === 'f' ? 'pela' : 'pelo');
  res = res.replace(/{{gen_dep}}/g, getPronomeDeputado(vars.genero, config.pronomeDeputado));
  res = res.replace(/{{gen_dep_exerc}}/g, getPronomeDeputado(vars.generoPresidenteExercicio, config.pronomeDeputado));
  res = res.replace(/{{gen_dep_l}}/g, vars.genero === 'f' ? 'deputada' : 'deputado');

  res = res.replace(/{{gen_senhor_abertura}}/g, genAbertura === 'f' ? 'a senhora' : 'o senhor');
  res = res.replace(/{{gen_o_abertura}}/g, genAbertura === 'f' ? 'a' : 'o');
  res = res.replace(/{{gen_O_abertura}}/g, genAbertura === 'f' ? 'A' : 'O');
  res = res.replace(/{{gen_pelo_abertura}}/g, genAbertura === 'f' ? 'pela' : 'pelo');
  res = res.replace(/{{gen_dep_abertura}}/g, getPronomeDeputado(genAbertura, config.pronomeDeputado));

  return res;
};

export const htmlToTemplate = (html: string) => {
  return html.replace(/<span[^>]*data-var="([^"]+)"[^>]*>.*?<\/span>/gi, '{{$1}}');
};

export const formatarDataBR = (dataIso: string) => {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split('-');
  if (!dia || !mes || !ano) return "";
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${parseInt(dia)} de ${meses[parseInt(mes)-1]} de ${ano}`;
};

export const converterTextoParaDataIso = (texto: string) => {
  if (!texto || texto === "XXX") return "";

  const matchSlash = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (matchSlash) {
    const dia = matchSlash[1].padStart(2, '0');
    const mes = matchSlash[2].padStart(2, '0');
    let ano = matchSlash[3];
    if (ano.length === 2) ano = "20" + ano;
    return `${ano}-${mes}-${dia}`;
  }

  const regex = /(\d{1,2})\s+de\s+([a-zç]+)(?:\s+de\s+(\d{4}))?/i;
  const match = texto.match(regex);
  if (!match) return "";
  const dia = match[1].padStart(2, '0');
  const meses: any = { janeiro:'01', fevereiro:'02', março:'03', abril:'04', maio:'05', junho:'06', julho:'07', agosto:'08', setembro:'09', outubro:'10', novembro:'11', dezembro:'12' };
  const mes = meses[match[2].toLowerCase()] || '01';
  const ano = match[3] || new Date().getFullYear().toString();
  return `${ano}-${mes}-${dia}`;
};

export const converterTextoParaHoraIso = (texto: string) => {
  if (!texto) return "";
  const match = texto.match(/(\d{1,2})\s*(?:h|:|horas)\s*(?:e\s*)?(\d{1,2})?/i);
  if (!match) return "";
  const h = match[1].padStart(2, '0');
  const m = (match[2] || '00').padStart(2, '0');
  return `${h}:${m}`;
};

export const formatarHoraBR = (horaIso: string) => {
  if (!horaIso) return "";
  const [h, m] = horaIso.split(':');
  if (!h || !m) return "";
  return `${h}h${m}`;
};

export const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
