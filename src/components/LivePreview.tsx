import React, { useState } from 'react';
import { Eye, Check, Copy } from 'lucide-react';
import { compileTextToPlain } from '../lib/ataTemplate';

interface LivePreviewProps {
  blocos: any;
  varsReuniao: any;
  onExport?: () => void;
  paperTheme?: 'light' | 'dark';
}

export const LivePreview = ({ blocos, varsReuniao, onExport, paperTheme = 'light' }: LivePreviewProps) => {
  const [previewMode, setPreviewMode] = useState<'single' | 'blocks'>('single');
  const [copied, setCopied] = useState(false);
  const [fontFamily, setFontFamily] = useState('Calibri, sans-serif');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('justify');

  const paperClass = paperTheme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-800';

  const closeTags = (htmlStr: string) => {
    if (!htmlStr) return "";
    const div = document.createElement('div');
    div.innerHTML = htmlStr;
    return div.innerHTML; 
  };

  const stripPunctuationSpaces = (html: string) => {
    // Remove spaces that appear just before commas, periods, semicolons, colons, closing parens
    return html.replace(/\s+([,\.;:!\?)])/g, '$1');
  };

  const getLivePreviewHtml = () => {
    let finalHtml = "";
    const stripBreaks = (htmlStr: string) => {
      let safeHtml = closeTags(htmlStr);
      return safeHtml.replace(/<br\s*\/?>/gi, ' ').replace(/<\/?(p|div|li)[^>]*>/gi, ' ').replace(/\s+/g, ' ').trim();
    };

    const compile = (bloco: string) => stripPunctuationSpaces(compileTextToPlain(bloco, varsReuniao));

    let ordem_do_dia_completa = "";
    if (blocos.ordem_a) ordem_do_dia_completa += `${closeTags(compile(blocos.ordem_a))} `;
    if (blocos.ordem_b) ordem_do_dia_completa += `${closeTags(compile(blocos.ordem_b))} `;
    if (blocos.ordem_c) ordem_do_dia_completa += `${closeTags(compile(blocos.ordem_c))}`;
    ordem_do_dia_completa = stripPunctuationSpaces(ordem_do_dia_completa.trim());

    if (previewMode === 'single') {
      finalHtml += `${stripBreaks(compile(blocos.presencas))} ${stripBreaks(compile(blocos.abertura))} ${stripBreaks(compile(blocos.expediente))} ${stripBreaks(ordem_do_dia_completa)} ${stripBreaks(compile(blocos.encerramento))}`;
    } else {
      finalHtml += `${closeTags(compile(blocos.presencas)).trim()}<br><br>${closeTags(compile(blocos.abertura)).trim()}<br><br>${closeTags(compile(blocos.expediente)).trim()}<br><br>${ordem_do_dia_completa}<br><br>${closeTags(compile(blocos.encerramento)).trim()}`;
    }
    return stripPunctuationSpaces(finalHtml);
  };

  const copyToClipboard = () => {
    const tempDiv = document.createElement('div');
    // Wrap the content in a div with the selected styles to preserve formatting on paste
    const styledHtml = `<div style="font-family: ${fontFamily}; text-align: ${textAlign};">${getLivePreviewHtml()}</div>`;
    tempDiv.innerHTML = styledHtml;
    tempDiv.style.position = 'fixed'; tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    const selection = window.getSelection(); const range = document.createRange();
    if (selection && range) {
      range.selectNodeContents(tempDiv); selection.removeAllRanges(); selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges(); 
    }
    document.body.removeChild(tempDiv);
    setCopied(true); setTimeout(() => setCopied(false), 3000);
    if (onExport) onExport();
  };

  return (
    <div className="mt-12 bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl"><Eye size={24} className="text-white" /></div>
          <div>
            <h2 className="text-xl font-black text-white">Documento Final em Tempo Real</h2>
            <p className="text-slate-400 text-xs mt-1">A junção perfeita das caixas, livre de vazamentos.</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-800 rounded-xl p-1">
          <button onClick={() => setPreviewMode('single')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${previewMode === 'single' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Regra de Ouro (Parágrafo Único)</button>
          <button onClick={() => setPreviewMode('blocks')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${previewMode === 'blocks' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Leitura por Blocos</button>
        </div>
      </div>
      <div className={`p-8 border-b border-slate-200 ${paperTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl border shadow-sm ${paperTheme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${paperTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Fonte:</span>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              className={`text-sm rounded-lg block p-2 outline-none border focus:ring-blue-500 focus:border-blue-500 ${paperTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700'}`}
            >
              <option value="Calibri, sans-serif">Calibri</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', Times, serif">Times New Roman</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold hidden md:block ${paperTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Alinhamento:</span>
            <div className={`flex p-1 rounded-lg text-sm ${paperTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button onClick={() => setTextAlign('left')} className={`px-3 py-1.5 rounded-md transition-all ${textAlign === 'left' ? (paperTheme === 'dark' ? 'bg-slate-700 shadow-sm font-bold text-blue-400' : 'bg-white shadow-sm font-bold text-blue-600') : 'text-slate-500 hover:text-slate-400'}`}>Esquerda</button>
              <button onClick={() => setTextAlign('center')} className={`px-3 py-1.5 rounded-md transition-all ${textAlign === 'center' ? (paperTheme === 'dark' ? 'bg-slate-700 shadow-sm font-bold text-blue-400' : 'bg-white shadow-sm font-bold text-blue-600') : 'text-slate-500 hover:text-slate-400'}`}>Centro</button>
              <button onClick={() => setTextAlign('right')} className={`px-3 py-1.5 rounded-md transition-all ${textAlign === 'right' ? (paperTheme === 'dark' ? 'bg-slate-700 shadow-sm font-bold text-blue-400' : 'bg-white shadow-sm font-bold text-blue-600') : 'text-slate-500 hover:text-slate-400'}`}>Direita</button>
              <button onClick={() => setTextAlign('justify')} className={`px-3 py-1.5 rounded-md transition-all ${textAlign === 'justify' ? (paperTheme === 'dark' ? 'bg-slate-700 shadow-sm font-bold text-blue-400' : 'bg-white shadow-sm font-bold text-blue-600') : 'text-slate-500 hover:text-slate-400'}`}>Justificar</button>
            </div>
          </div>
        </div>

        <div 
          className={`w-full max-w-4xl mx-auto p-10 shadow-sm rounded-xl text-[15px] leading-relaxed transition-all duration-300 ${paperClass}`} 
          style={{ fontFamily, textAlign }}
          dangerouslySetInnerHTML={{ __html: getLivePreviewHtml() }} 
        />
      </div>
      <div className={`p-6 flex flex-col items-center ${paperTheme === 'dark' ? 'bg-slate-900 border-t border-slate-800' : 'bg-white'}`}>
        <button onClick={copyToClipboard} className="w-full max-w-lg bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/30 text-lg">
          {copied ? <><Check size={24} /> COPIADO COM SUCESSO!</> : <><Copy size={24} /> COPIAR DOCUMENTO FINAL</>}
        </button>
        {copied && <p className="text-sm text-emerald-600 font-bold mt-4 animate-in fade-in">Pronto! Cole no Microsoft Word. A formatação será idêntica às caixas.</p>}
      </div>
    </div>
  );
};
