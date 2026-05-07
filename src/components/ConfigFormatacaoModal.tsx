import React from 'react';
import { Settings, X, AlignLeft, Hash, Clock, CalendarDays } from 'lucide-react';

interface ConfigFormatacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  updateConfig: (key: string, value: string) => void;
}

export const ConfigFormatacaoModal = ({ isOpen, onClose, config, updateConfig, theme = 'light' }: any) => {
  if (!isOpen) return null;

  const currentConfig = config || {};

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className={`rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-900'}`}>
        <div className={`flex justify-between items-start mb-6 border-b pb-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              <Settings size={22} />
            </div>
            <div>
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Formatação das Variáveis</h3>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Escolha como as variáveis serão exibidas no texto final.</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
             <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><Hash size={14}/> NÚMERO DA ATA</label>
              <select 
                value={currentConfig.ataNum || 'ordinal'}
                onChange={(e) => updateConfig('ataNum', e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="ordinal">Ordinal (Ex: 8ª)</option>
                <option value="extenso">Extenso (Ex: oitava)</option>
                <option value="numero">Número (Ex: 8)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><CalendarDays size={14}/> DATA DA REUNIÃO</label>
              <select 
                value={currentConfig.ataData || 'extenso'}
                onChange={(e) => updateConfig('ataData', e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="extenso">Extenso (Ex: 7 de junho de 2026)</option>
                <option value="numerico">Numérico (Ex: 07/06/2026)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><Clock size={14}/> HORÁRIO</label>
              <select 
                value={currentConfig.horario || 'numero'}
                onChange={(e) => updateConfig('horario', e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="numero">Numérico (Ex: 14h / 14h30)</option>
                <option value="extenso">Extenso (Ex: quatorze horas)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><AlignLeft size={14}/> NOME DA PRESIDÊNCIA</label>
              <select 
                value={currentConfig.nomePresidente || 'normal'}
                onChange={(e) => updateConfig('nomePresidente', e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="normal">Normal (Como digitado)</option>
                <option value="maiusculo">Maiúsculo (Ex: JOÃO SILVA)</option>
                <option value="capitalizado">Primeira Letra Maiúscula</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><AlignLeft size={14}/> NOME DA SECRETARIA</label>
              <select 
                value={currentConfig.nomeSecretario || 'normal'}
                onChange={(e) => updateConfig('nomeSecretario', e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="normal">Normal (Como digitado)</option>
                <option value="maiusculo">Maiúsculo (Ex: MARIA SILVA)</option>
                <option value="capitalizado">Primeira Letra Maiúscula</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><AlignLeft size={14}/> PRONOME (DEPUTADO/A)</label>
              <select 
                value={currentConfig.pronomeDeputado || 'capitalizado'}
                onChange={(e) => updateConfig('pronomeDeputado', e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <option value="capitalizado">Capitalizado (Ex: Deputado/a)</option>
                <option value="maiusculo">Maiúsculo (Ex: DEPUTADO/A)</option>
                <option value="minusculo">Minúsculo (Ex: deputado/a)</option>
                <option value="abreviado">Abreviado (Ex: Dep.)</option>
              </select>
            </div>

          </div>
        </div>

        <div className={`mt-8 pt-4 border-t flex justify-end ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
           >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
