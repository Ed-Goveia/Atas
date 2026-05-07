import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, RefreshCcw, Wand2, 
  CalendarDays, Clock, Layers, Users, 
  History, FileText, Archive, LogOut,
  Save, History as HistoryIcon, Home, Settings, Undo2, Redo2, Scale, Mic
} from 'lucide-react';
import { CaixaEdicao } from './components/CaixaEdicao';
import { LivePreview } from './components/LivePreview';
import { MenuVariaveis } from './components/MenuVariaveis';
import { ConfigFormatacaoModal } from './components/ConfigFormatacaoModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { processAtaText } from './lib/ataParser';
import { formatarDataBR, converterTextoParaDataIso, getOrdinal } from './lib/ataTemplate';
import { Dashboard } from './components/Dashboard';
import { TimeMachine } from './components/TimeMachine';
import { AtaDocument, AtaHistory } from './types';
import { DataVariacao, HoraVariacao, TextoVariacao } from './components/VariableControls';
import { BRANDING } from './branding';

const generateTitle = (vars: any) => {
  if (!vars) return 'Ata Sem Título';
  const num = vars.ataNum && String(vars.ataNum).toUpperCase() !== 'XXX' ? getOrdinal(String(vars.ataNum), 'ordinal') : '';
  const numStr = num ? ` ${num}` : '';
  const dataStr = vars.ataData && String(vars.ataData).toUpperCase() !== 'XXX' ? ` (${vars.ataData})` : '';
  const typeStr = vars.tipo === 'audiencia' ? 'Audiência Pública' : 'Reunião Deliberativa';
  return `Ata da${numStr} ${typeStr}${dataStr}`.trim();
};

const App = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new' | 'editor'>('dashboard');
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [paperTheme, setPaperTheme] = useState<'light'|'dark'>('light');
  const [atas, setAtas] = useState<AtaDocument[]>([]);
  const [currentAtaId, setCurrentAtaId] = useState<string | null>(null);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRawTextOpen, setIsRawTextOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [inputMeetingType, setInputMeetingType] = useState<'deliberativa'|'audiencia'>('deliberativa');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const rawInputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<any>(null);
  
  // States for Undo/Redo
  const [pastStates, setPastStates] = useState<any[]>([]);
  const [futureStates, setFutureStates] = useState<any[]>([]);
  const isUndoRedoAction = useRef(false);

  const [blocos, setBlocos] = useState<any>({
    presencas: "", abertura: "", expediente: "", 
    ordem_a: "", ordem_b: "", ordem_c: "", encerramento: ""
  });

  const [varsReuniao, setVarsReuniao] = useState<any>({
    genero: 'f', ataNum: '', ataData: '', horario: '', nomePresidente: '', nomeSecretario: ''
  });

  const [inputVars, setInputVars] = useState<any>({
    ataNum: '', horario: '', nomePresidente: '', nomeSecretario: ''
  });

  // Load configs from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('atas_casp_v1');
    if (saved) {
      try { setAtas(JSON.parse(saved)); } catch (e) { console.error('Erro ao ler localStorage', e); }
    }
    const savedTheme = localStorage.getItem('atas_casp_theme');
    const savedPaper = localStorage.getItem('atas_casp_paper');
    if (savedTheme) setTheme(savedTheme as 'light'|'dark');
    if (savedPaper) setPaperTheme(savedPaper as 'light'|'dark');
  }, []);

  // Router functions (Browser Back/Forward)
  const navigateTo = (view: 'dashboard' | 'new' | 'editor', ataId?: string | null) => {
    setCurrentView(view);
    if (ataId !== undefined) setCurrentAtaId(ataId);
    // Reset transient UI state when changing views
    if (view === 'new' || view === 'dashboard') {
      setIsProcessing(false);
      setError(null);
    }
    const params = new URLSearchParams();
    params.set('view', view);
    if (ataId) params.set('id', ataId);
    window.history.pushState({ view, ataId }, '', `?${params.toString()}`);
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setIsProcessing(false);
      setError(null);
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
        setCurrentAtaId(e.state.ataId || null);
        setIsConfigOpen(false);
        setIsRawTextOpen(false);
        setIsTimeMachineOpen(false);
      } else {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view') as 'dashboard' | 'new' | 'editor';
        if (viewParam) {
          setCurrentView(viewParam);
          setCurrentAtaId(params.get('id') || null);
        } else {
          setCurrentView('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('atas_casp_theme', newTheme);
  };

  const togglePaperTheme = () => {
    const newPaper = paperTheme === 'light' ? 'dark' : 'light';
    setPaperTheme(newPaper);
    localStorage.setItem('atas_casp_paper', newPaper);
  };

  // Auto-save logic
  useEffect(() => {
    if (currentView === 'editor' && currentAtaId) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        setAtas(prev => {
          const updated = prev.map(a => {
            if (a.id === currentAtaId) {
               const newHist = [...a.history];
               const lastHist = newHist[newHist.length - 1];
               // Auto backup (TimeMachine) se o ultimo salvo tiver > 5 mins
               if (!lastHist || (Date.now() - lastHist.timestamp > 5 * 60 * 1000)) {
                 newHist.push({ timestamp: Date.now(), blocos, varsReuniao });
               }
               return {
                 ...a,
                 updatedAt: Date.now(),
                 title: generateTitle(varsReuniao) || a.title,
                 blocos,
                 varsReuniao,
                 history: newHist
               };
            }
            return a;
          });
          localStorage.setItem('atas_casp_v1', JSON.stringify(updated));
          return updated;
        });
        setLastSaved(Date.now());
      }, 3000);
    }
  }, [blocos, varsReuniao, currentAtaId, currentView]);

  // Debounced history capture for Undo/Redo
  useEffect(() => {
    if (currentView !== 'editor') return;
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setPastStates(prev => {
        const last = prev[prev.length - 1];
        if (!last || JSON.stringify(last.blocos) !== JSON.stringify(blocos) || JSON.stringify(last.vars) !== JSON.stringify(varsReuniao)) {
          return [...prev, { blocos, vars: varsReuniao }].slice(-50);
        }
        return prev;
      });
      setFutureStates([]);
    }, 800);
    return () => clearTimeout(timer);
  }, [blocos, varsReuniao, currentView]);

  const handleUndo = () => {
    if (pastStates.length > 1) {
       const previous = pastStates[pastStates.length - 2];
       const current = pastStates[pastStates.length - 1];
       
       isUndoRedoAction.current = true;
       setFutureStates(prev => [current, ...prev]);
       setPastStates(prev => prev.slice(0, prev.length - 1));
       
       setBlocos(previous.blocos);
       setVarsReuniao(previous.vars);
       setInputVars({
         ataNum: previous.vars?.ataNum, horario: previous.vars?.horario,
         nomePresidente: previous.vars?.nomePresidente, nomeSecretario: previous.vars?.nomeSecretario,
         nomePresidenteExercicio: previous.vars?.nomePresidenteExercicio,
         temaDebate: previous.vars?.temaDebate, numRequerimento: previous.vars?.numRequerimento
       });
    }
  };

  const handleRedo = () => {
    if (futureStates.length > 0) {
       const next = futureStates[0];
       
       isUndoRedoAction.current = true;
       setPastStates(prev => [...prev, next]);
       setFutureStates(prev => prev.slice(1));
       
       setBlocos(next.blocos);
       setVarsReuniao(next.vars);
       setInputVars({
         ataNum: next.vars?.ataNum, horario: next.vars?.horario,
         nomePresidente: next.vars?.nomePresidente, nomeSecretario: next.vars?.nomeSecretario,
         nomePresidenteExercicio: next.vars?.nomePresidenteExercicio,
         temaDebate: next.vars?.temaDebate, numRequerimento: next.vars?.numRequerimento
       });
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc closes modals
      if (e.key === 'Escape') {
        setIsConfigOpen(false);
        setIsRawTextOpen(false);
        setIsTimeMachineOpen(false);
      }
      // Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-[9999] animate-in slide-in-from-bottom-5';
        toast.innerText = '✅ Progresso salvo!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      }
      // Ctrl+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (document.activeElement?.getAttribute('contenteditable') === 'true' || document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return; // let native handle it
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z (Redo)
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        if (document.activeElement?.getAttribute('contenteditable') === 'true' || document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pastStates, futureStates]);

  const updateVar = (campo: string, novoValor: string) => {
    const valorAntigo = varsReuniao ? varsReuniao[campo] : undefined;
    if (valorAntigo === novoValor) return;
    setVarsReuniao((prev: any) => ({ ...(prev || {}), [campo]: novoValor }));
  };

  const updateConfig = (key: string, value: string) => {
    setVarsReuniao((prev: any) => ({
      ...(prev || {}),
      config: { ...((prev || {}).config || {}), [key]: value }
    }));
  };

  const markAsExported = () => {
    setAtas(prev => {
       const updated = prev.map(a => a.id === currentAtaId ? { ...a, status: 'Exportada' as const } : a);
       localStorage.setItem('atas_casp_v1', JSON.stringify(updated));
       return updated;
    });
  };

  const processLocally = () => {
    const rawContent = inputRef.current?.innerHTML;
    if (!rawContent || rawContent === '<br>') { setError("Cole o texto bruto na caixa acima."); return; }
    setIsProcessing(true); setError(null);
    
    try {
      processAtaText(rawContent, inputMeetingType, (finalBlocos, finalVarsReuniao) => {
        setVarsReuniao(finalVarsReuniao);
        setInputVars({ 
          ataNum: finalVarsReuniao.ataNum, horario: finalVarsReuniao.horario,
          nomePresidente: finalVarsReuniao.nomePresidente, nomeSecretario: finalVarsReuniao.nomeSecretario,
          nomePresidenteExercicio: finalVarsReuniao.nomePresidenteExercicio,
          temaDebate: finalVarsReuniao.temaDebate, numRequerimento: finalVarsReuniao.numRequerimento
        });
        setBlocos(finalBlocos);
        
        // Criar nova ATA
        const novaAta: AtaDocument = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          title: generateTitle(finalVarsReuniao),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'Rascunho',
          tags: [],
          notes: '',
          blocos: finalBlocos,
          varsReuniao: finalVarsReuniao,
          history: [{ timestamp: Date.now(), blocos: finalBlocos, varsReuniao: finalVarsReuniao }],
          rawContent: rawContent
        };
        
        setAtas(prev => [novaAta, ...prev]);
        setPastStates([{ blocos: finalBlocos, vars: finalVarsReuniao }]);
        setFutureStates([]);
        
        setTimeout(() => { navigateTo('editor', novaAta.id); setIsProcessing(false); }, 400);
      });
    } catch (e: any) {
      setError(e.message || "Erro ao dividir o texto."); setIsProcessing(false);
    }
  };

  const handleRichTextChange = (bloco: string, valor: string) => setBlocos((prev: any) => ({ ...prev, [bloco]: valor }));

  const loadAta = (id: string) => {
    const ata = atas.find(a => a.id === id);
    if (!ata) return;
    setBlocos(ata.blocos);
    setVarsReuniao(ata.varsReuniao);
    setInputVars({
       ataNum: ata.varsReuniao?.ataNum, horario: ata.varsReuniao?.horario,
       nomePresidente: ata.varsReuniao?.nomePresidente, nomeSecretario: ata.varsReuniao?.nomeSecretario,
       nomePresidenteExercicio: ata.varsReuniao?.nomePresidenteExercicio,
       temaDebate: ata.varsReuniao?.temaDebate, numRequerimento: ata.varsReuniao?.numRequerimento
    });
    setPastStates([{ blocos: ata.blocos, vars: ata.varsReuniao }]);
    setFutureStates([]);
    navigateTo('editor', ata.id);
  };

  const deleteAta = (id: string) => {
    setAtas(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('atas_casp_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const updateAtaMeta = (id: string, tags: string[], notes: string, status: string) => {
    setAtas(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, tags, notes, status: status as any, updatedAt: Date.now() } : a);
      localStorage.setItem('atas_casp_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const currentAta = atas.find(a => a.id === currentAtaId);

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans pb-32 relative transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
      <div className="max-w-6xl mx-auto">
        <header className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 p-6 rounded-2xl shadow-sm border transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-700 p-3 rounded-xl text-white shadow-md cursor-pointer hover:bg-blue-800 transition-colors" onClick={() => navigateTo('dashboard')}><Wand2 size={28} /></div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{BRANDING.appName} <span className="text-blue-600 text-sm align-middle bg-blue-100 px-2 py-1 rounded-md ml-2">{BRANDING.badge}</span></h1>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{BRANDING.tagline}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className={`p-2 rounded-lg font-bold text-xs border transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
               Modo Global: {theme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
             </button>
             <button onClick={togglePaperTheme} className={`p-2 rounded-lg font-bold text-xs border transition-colors ${paperTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
               Modo da Folha: {paperTheme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
             </button>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {currentView === 'editor' && (
              <>
                <span className={`text-xs font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
                  {lastSaved ? <><Save size={12} className="text-emerald-500"/> Salvo às {new Date(lastSaved).toLocaleTimeString()}</> : 'Aguardando alterações...'}
                </span>
                
                <div className="flex items-center ml-2 border rounded-lg overflow-hidden shadow-sm">
                  <button onClick={handleUndo} disabled={pastStates.length <= 1} title="Desfazer (Ctrl+Z)" className={`p-2 transition-colors disabled:opacity-30 ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-r border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border-r border-slate-200'}`}>
                    <Undo2 size={18} />
                  </button>
                  <button onClick={handleRedo} disabled={futureStates.length === 0} title="Refazer (Ctrl+Y)" className={`p-2 transition-colors disabled:opacity-30 ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    <Redo2 size={18} />
                  </button>
                </div>

                <button onClick={() => navigateTo('dashboard')} className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}><Home size={18} /> Acervo</button>
              </>
            )}
            
            {currentView === 'new' && (
               <button onClick={() => navigateTo('dashboard')} className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}><Home size={18} /> Voltar</button>
            )}
          </div>
        </header>

        {currentView === 'dashboard' && (
          <Dashboard atas={atas} onNewAta={() => navigateTo('new')} onOpenAta={loadAta} onDeleteAta={deleteAta} onUpdateMeta={updateAtaMeta} theme={theme} />
        )}

        {currentView === 'new' && (
          <div className={`rounded-2xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}><Sparkles className="text-blue-500" size={20} /> Cole o texto bruto da Ata (SILEG)</h2>
                
                <div className={`flex p-1 rounded-lg mt-3 sm:mt-0 text-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <button onClick={() => setInputMeetingType('deliberativa')} className={`px-4 py-1.5 rounded-md font-bold transition-all ${inputMeetingType === 'deliberativa' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>Deliberativa</button>
                  <button onClick={() => setInputMeetingType('audiencia')} className={`px-4 py-1.5 rounded-md font-bold transition-all ${inputMeetingType === 'audiencia' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>Audiência</button>
                </div>
              </div>
              {/* The paste area follows paperTheme (Modo da Folha), not the global theme */}
              <div ref={inputRef} contentEditable suppressContentEditableWarning className={`w-full min-h-[300px] mt-2 p-6 border rounded-xl focus:outline-none focus:ring-2 transition-all font-serif text-[15px] [&_b]:font-bold [&_strong]:font-bold [&_span[style*='bold']]:font-bold ${paperTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-blue-100'}`} data-placeholder="Dê Ctrl+V no texto copiado..." />
              {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">{error}</div>}
            </div>
            <div className={`p-6 flex justify-end border-t ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <button onClick={processLocally} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95">
                {isProcessing ? "Lendo..." : "LIMPAR E FORMATAR"}
              </button>
            </div>
          </div>
        )}

        {currentView === 'editor' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 relative">
            <div className="flex justify-between items-center z-50 sticky top-4">
               <div className="flex gap-2 items-center">
                 {/* Doc type pill */}
                 {currentAta && (
                   <span className={`hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border shadow-sm ${
                     currentAta.varsReuniao?.tipo === 'audiencia'
                       ? (theme === 'dark' ? 'bg-violet-900/40 border-violet-700 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700')
                       : (theme === 'dark' ? 'bg-blue-900/40 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700')
                   }`}>
                     {currentAta.varsReuniao?.tipo === 'audiencia' ? <Mic size={12} /> : <Scale size={12} />}
                     {currentAta.varsReuniao?.tipo === 'audiencia' ? 'Audiência Pública' : 'Deliberativa'}
                   </span>
                 )}
                 <button onClick={() => setIsTimeMachineOpen(true)} className={`border px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all font-bold text-sm group ${theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-blue-500' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300'}`}>
                   <HistoryIcon size={16} className="text-blue-500 group-hover:-rotate-45 transition-transform" /> 
                   Time Machine
                 </button>
                 <button onClick={() => setIsRawTextOpen(true)} className={`border px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all font-bold text-sm group ${theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-400'}`}>
                   <FileText size={16} className="text-slate-500" />
                   Texto Bruto
                 </button>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={() => setIsConfigOpen(true)} className={`border p-2.5 rounded-full shadow-lg flex items-center transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                   <Settings size={18} className="text-slate-500" />
                 </button>
                 <MenuVariaveis varsReuniao={varsReuniao} inputVars={inputVars} setInputVars={setInputVars} updateVar={updateVar} theme={theme} />
               </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                <ErrorBoundary title="Presenças">
                  <CaixaEdicao title="1. Presenças" icon={<Users size={16} className="text-slate-400" />} value={blocos.presencas} onChange={(val) => handleRichTextChange('presencas', val)} vars={varsReuniao} minHeight="120px" paperTheme={paperTheme}>
                    <div className={`flex items-center gap-2 backdrop-blur p-1.5 rounded-xl shadow-sm border ${paperTheme === 'dark' ? 'bg-slate-800/80 border-slate-600' : 'bg-white/50 border-slate-200/50'}`}>
                      <span className="text-[10px] font-bold text-blue-500 ml-2 hidden sm:block">ABERTURA:</span>
                      <HoraVariacao
                        label="Hora"
                        value={inputVars.horarioAbertura || varsReuniao?.horarioAbertura}
                        onChange={(v: string) => { setInputVars((prev: any) => ({ ...prev, horarioAbertura: v })); updateVar('horarioAbertura', v); }}
                      />
                    </div>
                  </CaixaEdicao>
                </ErrorBoundary>

                <ErrorBoundary title="Abertura">
                  <CaixaEdicao title="2. Abertura" icon={<History size={16} className="text-blue-500" />} value={blocos.abertura} onChange={(val) => handleRichTextChange('abertura', val)} vars={varsReuniao} minHeight="100px" paperTheme={paperTheme} className={`rounded-2xl shadow-sm border overflow-hidden transition-all ${paperTheme === 'dark' ? 'bg-slate-900 border-slate-700 focus-within:ring-2 focus-within:ring-slate-600 text-slate-200' : 'bg-white border-blue-200 ring-1 ring-blue-500/20 focus-within:ring-2 focus-within:ring-blue-400 text-slate-800'}`} headerClassName={`px-4 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${paperTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-blue-50 border-blue-200 text-slate-800'}`}>
                    <div className={`flex items-center gap-3 backdrop-blur p-1.5 rounded-xl shadow-sm flex-wrap w-full sm:w-auto border ${paperTheme === 'dark' ? 'bg-slate-800/80 border-slate-600 text-slate-200' : 'bg-white/50 border-blue-200/50 text-slate-800'}`}>
                      <span className="text-[10px] font-bold text-blue-500 ml-2 hidden sm:block">ATA ANTERIOR:</span>
                      <TextoVariacao 
                        label="Nº" 
                        value={inputVars.ataNum} 
                        onChange={(v: string) => { setInputVars((prev: any) => ({ ...prev, ataNum: v })); updateVar('ataNum', v); }} 
                        placeholder="ex: 8ª" 
                      />
                      <DataVariacao 
                        label="Data" 
                        value={varsReuniao?.ataData} 
                        onChange={(v: string) => updateVar('ataData', v)} 
                      />
                    </div>
                  </CaixaEdicao>
                </ErrorBoundary>

                {varsReuniao?.tipo !== 'audiencia' && (
                  <ErrorBoundary title="Expediente">
                    <CaixaEdicao title="3. Expediente" icon={<FileText size={16} className="text-slate-400" />} value={blocos.expediente} onChange={(val) => handleRichTextChange('expediente', val)} vars={varsReuniao} minHeight="120px" paperTheme={paperTheme} />
                  </ErrorBoundary>
                )}

                <ErrorBoundary title="Ordem do Dia">
                  <div className={`p-6 rounded-3xl shadow-lg border space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-800 border-slate-700'}`}>
                    <div className={`flex items-center gap-3 mb-4 border-b pb-4 ${theme === 'dark' ? 'text-slate-200 border-slate-800' : 'text-white border-slate-700'}`}>
                      <Archive size={24} className="text-blue-400" />
                      <div>
                        <h3 className="font-black text-lg uppercase tracking-wider">{varsReuniao?.tipo === 'audiencia' ? '3' : '4'}. Ordem do Dia</h3>
                        <p className="text-xs text-slate-400">Dividida em blocos para facilitar a revisão.</p>
                      </div>
                    </div>

                    {blocos.ordem_a && (
                      <CaixaEdicao title={varsReuniao?.tipo === 'audiencia' ? "Debate / Expositores" : "Bloco A - Requerimentos"} icon={<Layers size={14} className="text-slate-500" />} value={blocos.ordem_a} onChange={(val) => handleRichTextChange('ordem_a', val)} vars={varsReuniao} minHeight="150px" paperTheme={paperTheme} />
                    )}

                    {blocos.ordem_b && (
                      <CaixaEdicao title="Bloco B - Apreciação do Plenário" icon={<Layers size={14} className="text-slate-500" />} value={blocos.ordem_b} onChange={(val) => handleRichTextChange('ordem_b', val)} vars={varsReuniao} minHeight="150px" paperTheme={paperTheme} />
                    )}

                    {blocos.ordem_c && (
                      <CaixaEdicao title="Bloco C - Conclusiva pelas Comissões" icon={<Layers size={14} className="text-slate-500" />} value={blocos.ordem_c} onChange={(val) => handleRichTextChange('ordem_c', val)} vars={varsReuniao} minHeight="150px" paperTheme={paperTheme} />
                    )}
                  </div>
                </ErrorBoundary>

                <ErrorBoundary title="Encerramento">
                  <CaixaEdicao title={`${varsReuniao?.tipo === 'audiencia' ? '4' : '5'}. Encerramento`} icon={<LogOut size={16} className="text-blue-500" />} value={blocos.encerramento} onChange={(val) => handleRichTextChange('encerramento', val)} vars={varsReuniao} minHeight="120px" paperTheme={paperTheme} className={`rounded-2xl shadow-sm border overflow-hidden transition-all ${paperTheme === 'dark' ? 'bg-slate-900 border-slate-700 focus-within:ring-2 focus-within:ring-slate-600 text-slate-200' : 'bg-white border-blue-200 ring-1 ring-blue-500/20 focus-within:ring-2 focus-within:ring-blue-400 text-slate-800'}`} headerClassName={`px-4 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${paperTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-blue-50 border-blue-200 text-slate-800'}`}>
                    <div className={`flex items-center gap-3 backdrop-blur p-1.5 rounded-xl shadow-sm flex-wrap w-full sm:w-auto border ${paperTheme === 'dark' ? 'bg-slate-800/80 border-slate-600 text-slate-200' : 'bg-white/50 border-blue-200/50 text-slate-800'}`}>
                      <span className="text-[10px] font-bold text-blue-500 ml-2 hidden sm:block">FIM DA REUNIÃO:</span>
                      <HoraVariacao 
                        label="Hora" 
                        value={inputVars.horario || varsReuniao?.horario} 
                        onChange={(v: string) => { setInputVars((prev: any) => ({ ...prev, horario: v })); updateVar('horario', v); }} 
                      />
                    </div>
                  </CaixaEdicao>
                </ErrorBoundary>

            </div>

            <ErrorBoundary title="Live Preview">
              <LivePreview blocos={blocos} varsReuniao={varsReuniao} onExport={markAsExported} paperTheme={paperTheme} />
            </ErrorBoundary>
          </div>
        )}

        <ConfigFormatacaoModal 
          isOpen={isConfigOpen} 
          onClose={() => setIsConfigOpen(false)} 
          config={varsReuniao?.config || {}} 
          updateConfig={updateConfig} 
          theme={theme}
        />

        {isRawTextOpen && currentAta && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-3xl p-8 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col h-[80vh] border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Texto Bruto Original</h3>
                  <p className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Você pode colar um novo texto aqui para refazer completamente a extração.</p>
                  <div className={`inline-flex p-1 rounded-lg text-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <button onClick={() => setInputMeetingType('deliberativa')} className={`px-3 py-1 rounded-md font-bold transition-all ${inputMeetingType === 'deliberativa' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>Deliberativa</button>
                    <button onClick={() => setInputMeetingType('audiencia')} className={`px-3 py-1 rounded-md font-bold transition-all ${inputMeetingType === 'audiencia' ? (theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm border border-slate-600' : 'bg-white text-blue-700 shadow-sm border border-slate-200') : 'text-slate-500 hover:text-slate-400'}`}>Audiência</button>
                  </div>
                </div>
                <button onClick={() => setIsRawTextOpen(false)} className={`p-2 rounded-full transition-colors font-bold w-10 h-10 flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                  X
                </button>
              </div>
              <textarea 
                ref={rawInputRef}
                defaultValue={currentAta.rawContent || ''} 
                className={`w-full flex-1 p-6 border rounded-xl focus:outline-none focus:ring-2 transition-all font-serif text-[15px] resize-none mb-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-blue-100'}`}
                placeholder="Cole o texto bruto aqui..."
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setIsRawTextOpen(false)} className={`px-6 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                     const text = rawInputRef.current?.value;
                     if (!text) return;
                     setIsProcessing(true);
                     try {
                       processAtaText(text, inputMeetingType, (finalBlocos, finalVarsReuniao) => {
                          const mergedVars = {
                            ...finalVarsReuniao,
                            config: varsReuniao.config, // Preserve config
                            // Preserve manual inputs if they exist and are not empty
                            ataNum: varsReuniao.ataNum || finalVarsReuniao.ataNum,
                            horario: varsReuniao.horario || finalVarsReuniao.horario,
                            nomePresidente: varsReuniao.nomePresidente || finalVarsReuniao.nomePresidente,
                            nomeSecretario: varsReuniao.nomeSecretario || finalVarsReuniao.nomeSecretario,
                            nomePresidenteExercicio: varsReuniao.nomePresidenteExercicio || finalVarsReuniao.nomePresidenteExercicio,
                            suplentePresidiu: varsReuniao.suplentePresidiu !== undefined ? varsReuniao.suplentePresidiu : finalVarsReuniao.suplentePresidiu,
                            temaDebate: varsReuniao.temaDebate || finalVarsReuniao.temaDebate,
                            numRequerimento: varsReuniao.numRequerimento || finalVarsReuniao.numRequerimento,
                          };

                          setBlocos(finalBlocos);
                          setVarsReuniao(mergedVars);
                          setInputVars({ 
                            ataNum: mergedVars.ataNum, horario: mergedVars.horario,
                            nomePresidente: mergedVars.nomePresidente, nomeSecretario: mergedVars.nomeSecretario,
                            nomePresidenteExercicio: mergedVars.nomePresidenteExercicio,
                            temaDebate: mergedVars.temaDebate, numRequerimento: mergedVars.numRequerimento
                          });
                          setIsRawTextOpen(false);
                          setPastStates([{ blocos: finalBlocos, vars: mergedVars }]);
                          setFutureStates([]);
                          
                          // Atualiza no ata atual imediatamente
                          if (currentAtaId) {
                            setAtas(prev => {
                              const updated = prev.map(a => a.id === currentAtaId ? {
                                  ...a,
                                  rawContent: text,
                                  blocos: finalBlocos,
                                  varsReuniao: mergedVars,
                                  updatedAt: Date.now(),
                                  history: [...a.history, { timestamp: Date.now(), blocos: finalBlocos, varsReuniao: mergedVars }]
                              } : a);
                              localStorage.setItem('atas_casp_v1', JSON.stringify(updated));
                              return updated;
                            });
                          }
                       });
                     } catch (err: any) {
                       alert('Erro: ' + (err.message || 'Falha ao processar texto.'));
                       setIsProcessing(false);
                     }
                  }} 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
                 >
                  <RefreshCcw size={18} className={isProcessing ? "animate-spin" : ""} />
                  Refazer Formatação (Extrair)
                </button>
              </div>
            </div>
          </div>
        )}

        {isTimeMachineOpen && currentAta && (
           <TimeMachine 
             history={currentAta.history} 
             onClose={() => setIsTimeMachineOpen(false)}
             theme={theme}
             onRestore={(step) => {
                setBlocos(step.blocos);
                setVarsReuniao(step.varsReuniao);
                setInputVars({
                   ataNum: step.varsReuniao?.ataNum, horario: step.varsReuniao?.horario,
                   nomePresidente: step.varsReuniao?.nomePresidente, nomeSecretario: step.varsReuniao?.nomeSecretario,
                   nomePresidenteExercicio: step.varsReuniao?.nomePresidenteExercicio,
                   temaDebate: step.varsReuniao?.temaDebate, numRequerimento: step.varsReuniao?.numRequerimento
                });
                setIsTimeMachineOpen(false);
             }}
           />
        )}
      </div>
    </div>
  );
};

export default App;
