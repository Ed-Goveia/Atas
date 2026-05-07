import React from 'react';
import { History, RotateCcw, X, Clock } from 'lucide-react';
import { AtaHistory } from '../types';

interface TimeMachineProps {
  history: AtaHistory[];
  onRestore: (step: AtaHistory) => void;
  onClose: () => void;
}

export const TimeMachine = ({ history, onRestore, onClose, theme = 'light' }: any) => {
  return (
    <div className={`fixed inset-y-0 right-0 w-full max-w-sm shadow-2xl border-l z-[100] flex flex-col animate-in slide-in-from-right duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-6 flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-white'}`}>
        <div className="flex items-center gap-3">
          <History size={24} className="text-blue-400" />
          <h2 className="text-lg font-black tracking-tight">Time Machine</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className={`p-6 border-b ${theme === 'dark' ? 'bg-blue-900/20 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
        <p className={`text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
          Volte no tempo e restaure versões antigas desta ata. Um backup do estado completo é feito automaticamente antes de grandes alterações.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.slice().reverse().map((step: AtaHistory, idx: number) => (
          <div key={step.timestamp} className={`p-4 rounded-2xl shadow-sm hover:border-blue-500 transition-all flex flex-col gap-3 group relative overflow-hidden border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
             {idx === 0 && <span className={`absolute top-0 right-0 text-[10px] font-bold px-2 py-1 rounded-bl-lg ${theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>MAIS RECENTE</span>}
             
             <div className={`flex items-center gap-2 font-bold text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
               <Clock size={16} />
               {new Date(step.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               <span className={`font-medium text-xs ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                 {new Date(step.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
               </span>
             </div>

             <button 
               onClick={() => onRestore(step)}
               className={`mt-2 w-full font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-md border group-hover:border-transparent ${theme === 'dark' ? 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-blue-600 hover:text-white' : 'bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 border-slate-200'}`}
             >
               <RotateCcw size={16} /> Restaurar versão
             </button>
          </div>
        ))}
        {history.length === 0 && (
          <div className={`text-center text-sm mt-10 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
            Nenhum histórico disponível ainda. A sessão continuará salvando automaticamente as versões ao longo do tempo.
          </div>
        )}
      </div>
    </div>
  );
};
