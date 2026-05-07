import { escapeRegExp } from './ataTemplate';

export const processAtaText = (
  rawContent: string, 
  forceType: 'deliberativa'|'audiencia',
  onSuccess: (blocos: any, varsReuniao: any) => void
) => {
  const getCleanHTML = () => {
    const div = document.createElement('div');
    div.innerHTML = rawContent;
    const escapeHtml = (unsafe: string) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let cleanText = '';
    const walk = (node: ChildNode) => {
        if (node.nodeType === Node.TEXT_NODE) cleanText += escapeHtml(node.textContent || "");
        else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName ? el.tagName.toLowerCase() : '';
            if (tag === 'br') { cleanText += '\n'; return; }
            const isBold = tag === 'b' || tag === 'strong' || (el.style && (el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight) >= 600));
            if (isBold) cleanText += '<b>';
            el.childNodes.forEach(walk);
            if (isBold) cleanText += '</b>';
            if (['p', 'div', 'li', 'h1', 'tr'].includes(tag)) cleanText += '\n';
        }
    };
    walk(div);
    return cleanText.replace(/\n{3,}/g, '\n\n').trim();
  };

  let text = getCleanHTML();

  const markers = {
    abertura: text.search(/(?:<b[^>]*>)?\s*ABERTURA\s*(?:<\/b>)?\s*:/i),
    expediente: text.search(/(?:<b[^>]*>)?\s*EXPEDIENTE\s*(?:<\/b>)?\s*:/i),
    ordem: text.search(/(?:<b[^>]*>)?\s*ORDEM DO DIA\s*(?:<\/b>)?\s*:/i),
    encerramento: text.search(/(?:<b[^>]*>)?\s*ENCERRAMENTO\s*(?:<\/b>)?\s*:/i)
  };

  if (markers.abertura === -1 || markers.ordem === -1 || markers.encerramento === -1) {
    throw new Error("Marcadores obrigatórios não encontrados (ABERTURA, ORDEM DO DIA, ENCERRAMENTO).");
  }

  let iPresencas = text.search(/Às\s/i);
  if (iPresencas === -1 || iPresencas > markers.abertura) iPresencas = 0; 

  const rawPresencas = text.substring(iPresencas, markers.abertura).trim();
  const rawAbertura = text.substring(markers.abertura, markers.expediente !== -1 ? markers.expediente : markers.ordem).trim();
  
  let rawExpediente = '';
  if (markers.expediente !== -1) {
    rawExpediente = text.substring(markers.expediente, markers.ordem).trim();
  }
  
  let rawOrdemCompleta = text.substring(markers.ordem, markers.encerramento).trim();
  let rawEncerramento = text.substring(markers.encerramento).trim();

  const cleanMarker = (txt: string, markerStr: string) => txt.replace(new RegExp(`^(?:<b[^>]*>)?\\s*${markerStr}\\s*(?:<\\/b>)?\\s*:?\\s*(?:<\\/b>)?`, 'i'), '').trim();

  // Fatiador da Ordem do Dia
  let rawOrdemA = ""; let rawOrdemB = ""; let rawOrdemC = "";
  let conteudoOrdem = cleanMarker(rawOrdemCompleta, "ORDEM DO DIA");

  const idxA = conteudoOrdem.search(/(?:<b[^>]*>)?\s*A\s*-\s*Requerimentos/i);
  const idxB = conteudoOrdem.search(/(?:<b[^>]*>)?\s*B\s*-\s*Proposições Sujeitas à Apreciação do Plenário/i);
  const idxC = conteudoOrdem.search(/(?:<b[^>]*>)?\s*C\s*-\s*Proposições Sujeitas à Apreciação Conclusiva/i);

  if (idxA !== -1) {
    const endA = idxB !== -1 ? idxB : (idxC !== -1 ? idxC : conteudoOrdem.length);
    rawOrdemA = conteudoOrdem.substring(idxA, endA).trim();
  }
  if (idxB !== -1) {
    const endB = idxC !== -1 ? idxC : conteudoOrdem.length;
    rawOrdemB = conteudoOrdem.substring(idxB, endB).trim();
  }
  if (idxC !== -1) {
    rawOrdemC = conteudoOrdem.substring(idxC).trim();
  }
  if (idxA === -1 && idxB === -1 && idxC === -1) rawOrdemA = conteudoOrdem;

  // EXTRAÇÃO DE VARIÁVEIS (Nomes, Datas, Gênero)
  const isFem = text.substring(iPresencas, markers.abertura + 200).toLowerCase().includes("a senhora presidente");
  const tipoReuniao = forceType;
  const isAudiencia = tipoReuniao === 'audiencia';
  const generoDetectado = isFem ? 'f' : 'm';
  
  let numAtaExt = "XXX", dataAtaExt = "XXX", horaEncExt = "XXX";
  
  // Extração flexível do Número da Ata
  const matchNum = rawAbertura.match(/Ata\s+da(s)?\s+([^,]+?)\s+reuni/i);
  if (matchNum) {
    numAtaExt = matchNum[2].replace(/<\/?[^>]+(>|$)/g, "").trim();
    if (numAtaExt.toUpperCase() === "XXX" || numAtaExt.includes('{{')) numAtaExt = "";
  }

  // Extração flexível da Data da Ata
  // Matches "no dia " followed by anything up to a dot, comma or " do corrente"
  const matchData = rawAbertura.match(/realizada(s)?\s+no(s)?\s+dia(s)?\s+([^,.]+?)(\.|,|\s+do corrente|$)/i);
  if (matchData) {
    dataAtaExt = matchData[4].replace(/<\/?[^>]+(>|$)/g, "").replace(/XXX/gi, "").trim();
    if (dataAtaExt.toUpperCase() === "XXX" || dataAtaExt.includes('{{')) dataAtaExt = "";
  }


  const matchHora = rawEncerramento.match(/encerrou os trabalhos às (.*?)\./i);
  if (matchHora) horaEncExt = matchHora[1].replace(/<\/?[^>]+(\>|$)/g, "").trim();


  // Extract opening time from presencas - matches numeric patterns like 14h, 14h30, 14:00
  let horaAberturaExt = 'XXX';
  const matchHoraAbertura = rawPresencas.match(/[\xC0\xE0Aa][s]?\s+(\d{1,2}[h:]?\d{0,2})/);
  if (matchHoraAbertura) {
    horaAberturaExt = matchHoraAbertura[1].replace(/<[^>]+>/g, '').trim();
  }

  // Caça os nomes no texto original para habilitar substituição dinâmica
  let nomePresExt = "";
  const matchPres1 = rawPresencas.match(/([A-Za-zÀ-ÿ\s]+)\s*-\s*Presidente/i);
  if (matchPres1) nomePresExt = matchPres1[1].trim();

  if (!nomePresExt) {
    const matchPres2 = rawEncerramento.match(/assinada pel[oa] President[ea]?(\s*,)?\s*(?:Deputad[oa]\s+)?([A-Za-zÀ-ÿ\s]+?)\s*_{3,}/i);
    if (matchPres2) nomePresExt = matchPres2[2].trim();
  }

  if (!nomePresExt) nomePresExt = "Delegada Ione"; // Default fallback


  let nomeSecExt = "Calebe Nunes da Silva"; // Default fallback
  const matchSec = rawEncerramento.match(/eu[\s_,\,]+([A-Za-zÀ-ÿ\s]+)[\s_,\,]+Secretário-Executivo/i);
  if (matchSec) nomeSecExt = matchSec[1].replace(/_/g, '').replace(/,/g, '').trim();

  const applyGenderVars = (txt: string, isAbertura: boolean = false) => {
    let res = txt;
    if (isAbertura) {
      // For Abertura, we capture the titular's name if present
      const namePattern = (nomePresExt && nomePresExt !== "NOME") ? `(?:(,?\\s*(?:Deputado|Deputada)?\\s*${escapeRegExp(nomePresExt)}))?` : '()';
      const regexPresFull = new RegExp(`\\b(o senhor|a senhora|O|A|o|a|pelo|pela)\\s+Presidente\\b${namePattern}`, 'gi');
      
      res = res.replace(regexPresFull, (match, p1, p2) => {
        let gen = '{{gen_o_abertura}}';
        if (p1.toLowerCase() === 'o senhor' || p1.toLowerCase() === 'a senhora') gen = '{{gen_senhor_abertura}}';
        else if (p1 === 'O' || p1 === 'A') gen = '{{gen_O_abertura}}';
        else if (p1 === 'o' || p1 === 'a') gen = '{{gen_o_abertura}}';
        else if (p1.toLowerCase() === 'pelo' || p1.toLowerCase() === 'pela') gen = '{{gen_pelo_abertura}}';
        
        const suffixVar = p2 ? '{{suffix_abertura_com_nome}}' : '{{suffix_abertura_sem_nome}}';
        return `${gen} {{tituloPresidenteAbertura}}${suffixVar}`;
      });
      
      // Also catch any other standalone occurrences of the titular's name in Abertura
      if (nomePresExt && nomePresExt !== "NOME") {
        const presNameRegex = new RegExp(`\\b(Deputado|Deputada)\\b\\s+${escapeRegExp(nomePresExt)}`, 'gi');
        res = res.replace(presNameRegex, `{{gen_dep_abertura}} {{nomePresidenteAbertura}}`);
        res = res.replace(new RegExp(`\\b${escapeRegExp(nomePresExt)}\\b`, 'gi'), '{{nomePresidenteAbertura}}');
      }
    } else {
      // Normal replacement for Expediente / Encerramento
      res = res.replace(/\b(o senhor|a senhora)\s+Presidente\b/gi, `{{gen_senhor}} Presidente`);
      res = res.replace(/\b(O|A)\s+Presidente\b/g, `{{gen_O}} Presidente`);
      res = res.replace(/\b(o|a)\s+Presidente\b/g, `{{gen_o}} Presidente`);
      res = res.replace(/\b(pelo|pela)\s+Presidente\b/gi, `{{gen_pelo}} Presidente`);
      
      if (nomePresExt && nomePresExt !== "NOME") {
        const presNameRegex = new RegExp(`\\b(Deputado|Deputada)\\b\\s+${escapeRegExp(nomePresExt)}`, 'gi');
        res = res.replace(presNameRegex, `{{gen_dep}} {{nomePresidente}}`);
        res = res.replace(new RegExp(`\\b${escapeRegExp(nomePresExt)}\\b`, 'gi'), '{{nomePresidente}}');
      }
    }
    return res;
  };

  let tplExpediente = '';
  if (!isAudiencia) {
    if (rawExpediente) {
      tplExpediente = applyGenderVars(cleanMarker(rawExpediente, "EXPEDIENTE"));
      if (!tplExpediente.trim() || tplExpediente.toUpperCase().includes("XXX")) {
        tplExpediente = applyGenderVars("O Presidente informou que o expediente estava publicado na página da Comissão.");
      }
    } else {
      tplExpediente = applyGenderVars("O Presidente informou que o expediente estava publicado na página da Comissão.");
    }
  }
  
  let tplAbertura = '';
  if (isAudiencia) {
     tplAbertura = 'Havendo número regimental, {{gen_a_pres_exerc}} Presidente em exercício, {{gen_dep_exerc}} {{nomePresidenteExercicio}}, declarou aberta a presente reunião de Audiência Pública da Comissão de Administração e Serviço Público, convocada com o objetivo de debater: "{{temaDebate}}", tema do REQ {{numRequerimento}} CASP, de sua autoria.';
  } else {
     tplAbertura = applyGenderVars(cleanMarker(rawAbertura, "ABERTURA"), true);
     tplAbertura = tplAbertura.replace(/Ata\s+da(s)?\s+(?:<[^>]+>\s*)*([^,]+?)(?:\s*<\/[^>]+>)*\s+reunião/i, 'Ata da {{ataNum}} reunião');
     tplAbertura = tplAbertura.replace(/Ata\s+da(s)?\s+XXX\s+reunião/i, 'Ata da {{ataNum}} reunião');
     tplAbertura = tplAbertura.replace(/realizada(s)?\s+no(s)?\s+dia(s)?\s+(?:<[^>]+>\s*)*([^,.]+?)(?:\s*<\/[^>]+>)*\s*(\.|,|\s+do corrente|$)/i, 'realizada$1 no$2 dia$3 {{ataData}}$5');
  }

  let tplPresencas = applyGenderVars(rawPresencas);
  const regexPres = new RegExp(`\\b${escapeRegExp(nomePresExt)}\\b`, 'gi');
  const regexSec = new RegExp(`\\b${escapeRegExp(nomeSecExt)}\\b`, 'gi');

  if (nomePresExt && nomePresExt !== "NOME") tplPresencas = tplPresencas.replace(regexPres, '{{nomePresidente}}');

  let rawEncerramentoLimpo = cleanMarker(rawEncerramento, "ENCERRAMENTO").replace(/_{3,}/g, '');
  if (!isAudiencia) {
     rawEncerramentoLimpo = rawEncerramentoLimpo.replace(/convocou reunião para o dia[^\,]*?\, às[^\,]*?\, destinada à[^\,]*?\,\s*e\s*/gi, '');
  } else {
     rawEncerramentoLimpo = rawEncerramentoLimpo.replace(/Nada mais havendo a tratar.*?encerrou os trabalhos às[^\.]*\./gi, 'Nada mais havendo a tratar, {{gen_a_pres_exerc}} Presidente em exercício, {{gen_dep_exerc}} {{nomePresidenteExercicio}}, encerrou os trabalhos às {{horario}}.');
  }
  let tplEncerramento = applyGenderVars(rawEncerramentoLimpo);
  if (nomePresExt && nomePresExt !== "NOME") tplEncerramento = tplEncerramento.replace(regexPres, '{{nomePresidente}}');
  if (nomeSecExt && nomeSecExt !== "NOME") tplEncerramento = tplEncerramento.replace(regexSec, '{{nomeSecretario}}');
  if (horaEncExt && horaEncExt !== "XXX") tplEncerramento = tplEncerramento.replace(new RegExp(escapeRegExp(horaEncExt), 'gi'), '{{horario}}');
  // Template opening time in presencas
  if (horaAberturaExt && horaAberturaExt !== "XXX") tplPresencas = tplPresencas.replace(new RegExp(escapeRegExp(horaAberturaExt), 'gi'), '{{horarioAbertura}}');

  const formatBlock = (txt: string) => (txt || "").replace(/\n/g, '<br>');

  let finalOrdemA = formatBlock(rawOrdemA);
  let finalOrdemB = formatBlock(rawOrdemB);
  let finalOrdemC = formatBlock(rawOrdemC);

  let numReqToUse = "XXX";
  if (isAudiencia) {
     // Format expositors for Audiencia
     let reqExtracted = "XXX";
     const matchReq = rawOrdemA.match(/Req\.\s*([\d]+\/[\d]+)/i);
     if (matchReq) reqExtracted = matchReq[1];
     
     // Extract list of names: 1) NAME (Confirmado) Role...
     // We'll replace the numbers and make a semi-colon list.
     let expositors = "";
     const expositorRegex = /\d+\)\s+([A-Za-zÀ-ÿ\s]+)(?:\s*\((?:Confirmado|Confirmada|a Confirmar|Cancelado)\))?\s+([^0-9]+)/gi;
     const matches = [...rawOrdemA.matchAll(expositorRegex)];
     if (matches.length > 0) {
        expositors = matches.map((m, i) => {
           let nome = m[1].trim();
           let cargo = m[2].replace(/ENCERRAMENTO.*/gi, '').trim().replace(/[\r\n]+/g, ' ').replace(/\s+-\s+$/, '');
           return `<b>${nome}</b>, ${cargo}`;
        }).join('; ');
     } else {
        expositors = rawOrdemA.replace(/Req\..*?(?=\n)/i, '').trim();
     }

     finalOrdemA = `<b>ORDEM DO DIA:</b><br>Ao iniciar os trabalhos, {{gen_a_pres_exerc}} Presidente em exercício, fez uso da palavra, explicou como seria formada as mesas, e em seguida passou a palavra para os seguintes expositores: ${expositors}`;
     finalOrdemB = '';
     finalOrdemC = '';

     numReqToUse = reqExtracted !== "XXX" ? reqExtracted : "XXX";
  } else {
    if (finalOrdemA) finalOrdemA = `<b>ORDEM DO DIA:</b><br>${finalOrdemA}`;
    else if (finalOrdemB) finalOrdemB = `<b>ORDEM DO DIA:</b><br>${finalOrdemB}`;
    else if (finalOrdemC) finalOrdemC = `<b>ORDEM DO DIA:</b><br>${finalOrdemC}`;
    else finalOrdemA = `<b>ORDEM DO DIA:</b>`;
  }

  let finalVarsReuniao: any = { 
    tipo: tipoReuniao,
    genero: generoDetectado, ataNum: numAtaExt, ataData: dataAtaExt, 
    horario: horaEncExt, horarioAbertura: horaAberturaExt,
    nomePresidente: nomePresExt, nomeSecretario: nomeSecExt
  };

  if (isAudiencia) {
    finalVarsReuniao.nomePresidenteExercicio = "";
    finalVarsReuniao.generoPresidenteExercicio = "f";
    finalVarsReuniao.temaDebate = "";
    if (numReqToUse !== 'XXX') finalVarsReuniao.numRequerimento = numReqToUse;
  }

  const finalBlocos: any = {
    presencas: formatBlock(tplPresencas.replace(/^"|"$/g, '').trim()),
    abertura: isAudiencia ? `<b>ABERTURA:</b> ${tplAbertura}` : `<b>ABERTURA:</b> ${formatBlock(tplAbertura)}`,
  };
  
  if (tplExpediente) finalBlocos.expediente = `<b>EXPEDIENTE:</b> ${formatBlock(tplExpediente)}`;
  
  finalBlocos.ordem_a = finalOrdemA;
  if (!isAudiencia) {
    finalBlocos.ordem_b = finalOrdemB;
    finalBlocos.ordem_c = finalOrdemC;
  }
  
  finalBlocos.encerramento = `<b>ENCERRAMENTO:</b> ${formatBlock(tplEncerramento)}`;

  onSuccess(finalBlocos, finalVarsReuniao);
};
