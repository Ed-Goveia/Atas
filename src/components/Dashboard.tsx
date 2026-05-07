import React, { useState } from 'react';
import { FileText, Plus, Search, Calendar, ChevronRight, CheckCircle2, FileEdit, Trash2, AlertTriangle, X, Tag, MessageSquare, Clock, Scale, Mic } from 'lucide-react';
import { AtaDocument } from '../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; darkColor: string }> = {
  'Rascunho':  { label: 'Rascunho',  color: 'bg-amber-50 text-amber-700 border-amber-200',   darkColor: 'bg-amber-900/30 text-amber-400 border-amber-800' },
  'Revisão':   { label: 'Revisão',   color: 'bg-blue-50 text-blue-700 border-blue-200',       darkColor: 'bg-blue-900/30 text-blue-400 border-blue-800' },
  'Aprovada':  { label: 'Aprovada',  color: 'bg-violet-50 text-violet-700 border-violet-200', darkColor: 'bg-violet-900/30 text-violet-400 border-violet-800' },
  'Exportada': { label: 'Exportada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', darkColor: 'bg-emerald-900/30 text-emerald-400 border-emerald-800' },
};

const TIPO_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  'deliberativa': { label: 'Deliberativa', icon: <Scale size={12} /> },
  'audiencia':    { label: 'Audiência Pública', icon: <Mic size={12} /> },
};

const TAG_PRESETS = ['Urgente', 'Pendente', 'Revisado', 'Arquivado', 'Importante'];

interface NotesPanelProps {
  ata: AtaDocument;
  theme: string;
  onClose: () => void;
  onSave: (id: string, tags: string[], notes: string, status: string) => void;
}

const NotesPanel = ({ ata, theme, onClose, onSave }: NotesPanelProps) => {
  const [tags, setTags] = useState<string[]>(ata.tags || []);
  const [notes, setNotes] = useState(ata.notes || '');
  const [newTag, setNewTag] = useState('');
  const [status, setStatus] = useState(ata.status);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setNewTag('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Tags & Anotações</h3>
            <p className={`text-sm font-medium mt-1 truncate max-w-[300px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{ata.title}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className={`text-xs font-black uppercase tracking-wider block mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setStatus(key as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${status === key ? (theme === 'dark' ? cfg.darkColor : cfg.color) + ' ring-2 ring-offset-1 ring-blue-500' : (theme === 'dark' ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-400 hover:border-slate-400')}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-5">
          <label className={`text-xs font-black uppercase tracking-wider block mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span key={tag} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 opacity-60 hover:opacity-100"><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className={`flex gap-2 p-1 border rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag(newTag)}
              placeholder="Nova tag..."
              className={`flex-1 px-3 py-1.5 text-sm font-medium bg-transparent outline-none ${theme === 'dark' ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-700 placeholder:text-slate-400'}`}
            />
            <button onClick={() => addTag(newTag)} disabled={!newTag.trim()} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-blue-700 transition-colors">
              + Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TAG_PRESETS.filter(t => !tags.includes(t)).map(preset => (
              <button key={preset} onClick={() => addTag(preset)} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'}`}>
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className={`text-xs font-black uppercase tracking-wider block mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Observações</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Adicione observações sobre este documento..."
            className={`w-full p-4 text-sm rounded-xl border outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400'}`}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            Cancelar
          </button>
          <button
            onClick={() => { onSave(ata.id, tags, notes, status); onClose(); }}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard = ({ atas, onNewAta, onOpenAta, onDeleteAta, onUpdateMeta, theme = 'light' }: any) => {
  const [search, setSearch] = useState('');
  const [docToDelete, setDocToDelete] = useState<AtaDocument | null>(null);
  const [docForNotes, setDocForNotes] = useState<AtaDocument | null>(null);

  const filtered = atas.filter((a: AtaDocument) => {
    if (!search) return true;
    const s = search.toLowerCase();
    if (a.title.toLowerCase().includes(s)) return true;
    if (a.varsReuniao?.nomePresidente?.toLowerCase().includes(s)) return true;
    if (a.tags?.some((t: string) => t.toLowerCase().includes(s))) return true;
    if (a.notes?.toLowerCase().includes(s)) return true;
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
          placeholder="Buscar por título, nome, tag ou observação..."
          className={`w-full py-4 px-2 focus:outline-none font-medium text-lg placeholder:text-slate-400 ${theme === 'dark' ? 'bg-transparent text-slate-200' : 'bg-transparent text-slate-700'}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.sort((a: AtaDocument, b: AtaDocument) => b.updatedAt - a.updatedAt).map((ata: AtaDocument) => {
          const statusCfg = STATUS_CONFIG[ata.status] || STATUS_CONFIG['Rascunho'];
          const tipoCfg = TIPO_CONFIG[ata.varsReuniao?.tipo] || TIPO_CONFIG['deliberativa'];
          return (
            <div key={ata.id} className={`rounded-[24px] p-6 shadow-sm border hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
              {/* Top row */}
              <div className="flex justify-between items-start mb-4">
                {/* Tipo badge */}
                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${theme === 'dark' ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {tipoCfg.icon} {tipoCfg.label}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Status badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme === 'dark' ? statusCfg.darkColor : statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  {/* Notes / Tags button */}
                  <button
                    onClick={e => { e.stopPropagation(); setDocForNotes(ata); }}
                    title="Tags & Anotações"
                    className={`p-1.5 rounded-lg transition-colors ${(ata.notes || (ata.tags && ata.tags.length > 0)) ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                  >
                    <MessageSquare size={16} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); setDocToDelete(ata); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-lg font-bold mb-1 leading-tight group-hover:text-blue-500 transition-colors cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`} onClick={() => onOpenAta(ata.id)}>
                {ata.title || 'Ata Sem Título'}
              </h3>

              {/* Tags */}
              {ata.tags && ata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {ata.tags.slice(0, 3).map(tag => (
                    <span key={tag} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                      <Tag size={8} /> {tag}
                    </span>
                  ))}
                  {ata.tags.length > 3 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>+{ata.tags.length - 3}</span>}
                </div>
              )}

              {/* Notes snippet */}
              {ata.notes && (
                <p className={`text-xs mb-2 line-clamp-2 italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  "{ata.notes}"
                </p>
              )}

              <div className="space-y-1.5 mb-5 flex-1 mt-1 cursor-pointer" onClick={() => onOpenAta(ata.id)}>
                <p className={`text-xs font-medium flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Calendar size={12} /> {new Date(ata.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className={`text-xs font-medium flex items-center gap-1.5 truncate ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <FileText size={12} />
                  {ata.varsReuniao?.nomePresidente || 'Presidência não definida'}
                </p>
              </div>

              <div onClick={() => onOpenAta(ata.id)} className="flex items-center text-blue-500 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform mt-auto cursor-pointer">
                Abrir Documento <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          );
        })}

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

      {/* Delete Modal */}
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
              <button onClick={() => setDocToDelete(null)} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                Cancelar
              </button>
              <button
                onClick={() => { onDeleteAta(docToDelete.id); setDocToDelete(null); }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                Sim, excluir ata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes/Tags Modal */}
      {docForNotes && (
        <NotesPanel
          ata={docForNotes}
          theme={theme}
          onClose={() => setDocForNotes(null)}
          onSave={onUpdateMeta}
        />
      )}
    </div>
  );
};
