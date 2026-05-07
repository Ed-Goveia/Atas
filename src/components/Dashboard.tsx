import React, { useState } from 'react';
import { FileText, Plus, Search, Calendar, ChevronRight, CheckCircle2, FileEdit, Trash2, AlertTriangle, X } from 'lucide-react';
import { AtaDocument } from '../types';

interface DashboardProps {
  atas: AtaDocument[];
  onNewAta: () => void;
  onOpenAta: (id: string) => void;
  onDeleteAta: (id: string) => void;
}

export const Dashboard = ({ atas, onNewAta, onOpenAta, onDeleteAta, theme = 'light' }: any) => {
  const [search, setSearch] = useState('');
  const [docToDelete, setDocToDelete] = useState<AtaDocument | null>(null);

  const filtered = atas.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    if (a.title.toLowerCase().includes(s)) return true;
    if (a.varsReuniao?.nomePresidente?.toLowerCase().includes(s)) return true;
    if (a.varsReuniao?.nomeSecretario?.toLowerCase().includes(s)) return true;
    
    // Busca profunda no conteúdo dos blocos (AST)
    const content = JSON.stringify(a.blocos).toLowerCase();
    if (content.includes(s)) return true;
    
    return false;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Acervo de Atas</h2>
          <p className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Gerencie, busque e edite todas as suas atas de forma centralizada.</p>
        </div>
        <button onClick={onNewAta} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95">
          <Plus size={20} />
          Nova Ata (Colar Texto)
        </button>
      </div>

      <div className={`p-2 rounded-2xl shadow-sm border flex items-center gap-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="pl-4 text-slate-400"><Search size={22} /></div>
        <input 
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar no acervo global: nome, comissão, nº da ata ou trecho das decisões..." 
          className={`w-full py-4 px-2 focus:outline-none font-medium text-lg placeholder:text-slate-400 ${theme === 'dark' ? 'bg-transparent text-slate-200' : 'bg-transparent text-slate-700'}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.sort((a,b) => b.updatedAt - a.updatedAt).map(ata => (
          <div key={ata.id} className={`rounded-[24px] p-6 shadow-sm border hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:shadow-blue-900/20' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-slate-50 opacity-50 group-hover:to-blue-50 transition-colors pointer-events-none rounded-bl-full" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${ata.status === 'Exportada' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {ata.status === 'Exportada' ? <CheckCircle2 size={24} /> : <FileEdit size={24} />}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${ata.status === 'Exportada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {ata.status}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setDocToDelete(ata); }} 
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Excluir Ata"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className={`text-xl font-bold mb-2 leading-tight group-hover:text-blue-500 transition-colors cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`} onClick={() => onOpenAta(ata.id)}>{ata.title || "Ata Sem Título"}</h3>
            
            <div className="space-y-2 mb-6 flex-1 mt-2 cursor-pointer" onClick={() => onOpenAta(ata.id)}>
               <p className={`text-sm font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                 <Calendar size={14} /> Atualizada: {new Date(ata.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
               </p>
               <p className={`text-sm font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                 <FileText size={14} /> 
                 Presidência: {ata.varsReuniao?.tipo === 'audiencia' && ata.varsReuniao?.nomePresidenteExercicio 
                   ? `${ata.varsReuniao.nomePresidenteExercicio} (Exercício)`
                   : ata.varsReuniao?.nomePresidente || "N/A"}
               </p>
            </div>

            <div onClick={() => onOpenAta(ata.id)} className="flex items-center text-blue-500 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform mt-auto cursor-pointer">
              Abrir Documento <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300'}`}>
              <Search size={40} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Nenhuma ata encontrada</h3>
            <p className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>Tente buscar com outras palavras ou crie uma nova ata.</p>
          </div>
        )}
      </div>

      {docToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <button onClick={() => setDocToDelete(null)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                 <X size={20} />
              </button>
            </div>
            
            <h3 className={`text-2xl font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Excluir documento?</h3>
            <p className={`leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Você excluirá permanentemente a ata <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>"{docToDelete.title}"</strong> e todo o seu histórico de edições. Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDocToDelete(null)} 
                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
               >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDeleteAta(docToDelete.id);
                  setDocToDelete(null);
                }} 
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95"
               >
                Sim, excluir ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
