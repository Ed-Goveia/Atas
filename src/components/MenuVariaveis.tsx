import React, { useState } from 'react';
import { Settings2, UserCheck, Edit3 } from 'lucide-react';

interface MenuVariaveisProps {
  varsReuniao: any;
  inputVars: any;
  setInputVars: (fn: any) => void;
  updateVar: (key: string, value: string) => void;
}

export const MenuVariaveis = ({ varsReuniao, inputVars, setInputVars, updateVar, theme = 'light' }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex justify-end sticky top-4 z-50 mb-2">
      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all font-bold text-sm border group ${theme === 'dark' ? (isMenuOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-blue-500') : (isMenuOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300')}`}
        >
          <Settings2 size={16} className={isMenuOpen ? "text-white" : "text-blue-500"} /> 
          Variáveis do Documento
        </button>

        {isMenuOpen && (
          <div className={`absolute top-14 right-0 w-80 rounded-2xl shadow-2xl border p-5 animate-in fade-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200 shadow-slate-900/50' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
               Ajustes Globais
            </h4>
            
            <div className="space-y-4">
              {/* Toggle Gênero */}
              <div>
                <label className={`text-[11px] font-bold mb-1.5 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>GÊNERO DA PRESIDÊNCIA</label>
                <div className={`flex p-1 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <button onClick={() => updateVar('genero', 'f')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${varsReuniao?.genero === 'f' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>A Senhora</button>
                  <button onClick={() => updateVar('genero', 'm')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${varsReuniao?.genero === 'm' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>O Senhor</button>
                </div>
              </div>

              {/* Input Presidente */}
              <div>
                <label className={`text-[11px] font-bold mb-1.5 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><UserCheck size={12}/> NOME (PRESIDÊNCIA)</label>
                <input 
                  value={inputVars.nomePresidente}
                  onChange={(e) => setInputVars((prev: any) => ({ ...prev, nomePresidente: e.target.value }))}
                  onBlur={() => updateVar('nomePresidente', inputVars.nomePresidente)}
                  onKeyDown={(e) => e.key === 'Enter' && updateVar('nomePresidente', inputVars.nomePresidente)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-700' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                />
              </div>

              {/* Input Secretário */}
              <div>
                <label className={`text-[11px] font-bold mb-1.5 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><Edit3 size={12}/> NOME (SECRETÁRIO)</label>
                <input 
                  value={inputVars.nomeSecretario}
                  onChange={(e) => setInputVars((prev: any) => ({ ...prev, nomeSecretario: e.target.value }))}
                  onBlur={() => updateVar('nomeSecretario', inputVars.nomeSecretario)}
                  onKeyDown={(e) => e.key === 'Enter' && updateVar('nomeSecretario', inputVars.nomeSecretario)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-700' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                />
              </div>

              {/* Toggle Suplente (para deliberativa) */}
              {varsReuniao?.tipo !== 'audiencia' && (
                <div>
                  <label className={`text-[11px] font-bold mb-1.5 flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <input 
                      type="checkbox" 
                      checked={!!varsReuniao?.suplentePresidiu}
                      onChange={(e) => updateVar('suplentePresidiu', e.target.checked)}
                      className={`rounded focus:ring-blue-500 w-4 h-4 ${theme === 'dark' ? 'text-blue-500 bg-slate-800 border-slate-600' : 'text-blue-600'}`}
                    />
                    PRESIDIDA POR SUPLENTE?
                  </label>
                </div>
              )}

              {(varsReuniao?.tipo === 'audiencia' || varsReuniao?.suplentePresidiu) && (
                <div className={`pt-4 border-t space-y-4 p-3 rounded-xl ${theme === 'dark' ? 'border-slate-800 bg-orange-900/20' : 'border-slate-100 bg-orange-50/50'}`}>
                  <h5 className={`text-[10px] font-black uppercase tracking-widest leading-none ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>Dados do Pres. em Exercício</h5>
                  
                  <div>
                    <label className={`text-[11px] font-bold mb-1.5 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>GÊNERO PRES. EXERCÍCIO</label>
                    <div className={`flex p-1 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <button onClick={() => updateVar('generoPresidenteExercicio', 'f')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${varsReuniao?.generoPresidenteExercicio === 'f' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>A Senhora</button>
                      <button onClick={() => updateVar('generoPresidenteExercicio', 'm')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${varsReuniao?.generoPresidenteExercicio === 'm' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>O Senhor</button>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold mb-1.5 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><UserCheck size={12}/> PRES. EM EXERCÍCIO</label>
                    <input 
                      value={inputVars.nomePresidenteExercicio || varsReuniao?.nomePresidenteExercicio || ''}
                      onChange={(e) => setInputVars((prev: any) => ({ ...prev, nomePresidenteExercicio: e.target.value }))}
                      onBlur={() => updateVar('nomePresidenteExercicio', inputVars.nomePresidenteExercicio)}
                      onKeyDown={(e) => e.key === 'Enter' && updateVar('nomePresidenteExercicio', inputVars.nomePresidenteExercicio)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-700' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                    />
                  </div>
                </div>
              )}

              {varsReuniao?.tipo === 'audiencia' && (
                <div className={`pt-4 border-t space-y-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                  <h5 className={`text-[10px] font-black uppercase tracking-widest leading-none ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Dados da Audiência</h5>
                  
                  <div>
                    <label className={`text-[11px] font-bold mb-1.5 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>TEMA DO DEBATE</label>
                    <input 
                      value={inputVars.temaDebate || varsReuniao?.temaDebate || ''}
                      onChange={(e) => setInputVars((prev: any) => ({ ...prev, temaDebate: e.target.value }))}
                      onBlur={() => updateVar('temaDebate', inputVars.temaDebate)}
                      onKeyDown={(e) => e.key === 'Enter' && updateVar('temaDebate', inputVars.temaDebate)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-700' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold mb-1.5 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>NUM. REQUERIMENTO</label>
                    <input 
                      value={inputVars.numRequerimento || varsReuniao?.numRequerimento || ''}
                      onChange={(e) => setInputVars((prev: any) => ({ ...prev, numRequerimento: e.target.value }))}
                      onBlur={() => updateVar('numRequerimento', inputVars.numRequerimento)}
                      onKeyDown={(e) => e.key === 'Enter' && updateVar('numRequerimento', inputVars.numRequerimento)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-700' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
