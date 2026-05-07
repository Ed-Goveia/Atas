import React, { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Edit2, Check } from 'lucide-react';

interface CaixaEdicaoProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  vars: any;
  minHeight?: string;
  className?: string;
  headerClassName?: string;
  children?: React.ReactNode; // Para injetar os inputs de ata anterior, etc.
  paperTheme?: 'light' | 'dark';
}

export const CaixaEdicao = ({ 
  title, 
  icon, 
  value, 
  onChange, 
  vars, 
  minHeight = "120px",
  paperTheme = "light",
  className,
  headerClassName,
  children
}: CaixaEdicaoProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const defaultClass = paperTheme === 'dark' 
    ? "bg-slate-900 rounded-2xl shadow-sm border border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-slate-600 transition-all text-slate-200"
    : "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-slate-200 transition-all text-slate-800";

  const defaultHeaderClass = paperTheme === 'dark'
    ? "bg-slate-800 px-4 py-3 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-slate-200"
    : "bg-slate-50 px-4 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-slate-800";

  return (
    <div className={className || defaultClass}>
      <div className={headerClassName || defaultHeaderClass}>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className={`font-bold text-sm uppercase tracking-wider ${paperTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {children}
          <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`p-1.5 focus:outline-none rounded-lg border transition-colors flex items-center justify-center flex-shrink-0 relative group h-8 w-8 ml-2 ${
               isEditing ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300'
             }`}
           >
             {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
             <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-max px-2 py-1 text-[10px] font-bold text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
               {isEditing ? "Concluir edição de texto" : "Editar texto livremente"}
             </span>
           </button>
        </div>
      </div>
      <RichTextEditor 
        value={value} 
        onChange={onChange} 
        minHeight={minHeight} 
        vars={vars} 
        readOnly={!isEditing}
      />
    </div>
  );
};
