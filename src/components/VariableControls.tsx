import React from 'react';
import { CalendarDays, Clock, Hash } from 'lucide-react';
import { converterTextoParaDataIso, formatarDataBR, converterTextoParaHoraIso, formatarHoraBR } from '../lib/ataTemplate';

export const DataVariacao = ({ label, value, onChange }: any) => {
  return (
    <div className="flex items-center bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 rounded-lg shadow-sm transition-all overflow-hidden h-8 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
      {label && (
        <span className="text-[10px] font-black text-slate-500 bg-slate-50 h-full flex items-center px-2.5 border-r border-slate-200 uppercase tracking-wider">
          <CalendarDays size={12} className="mr-1.5 text-blue-500" />
          {label}
        </span>
      )}
      <input 
        type="date"
        value={converterTextoParaDataIso(value)}
        onClick={(e: any) => e.target.showPicker && e.target.showPicker()}
        onChange={(e) => {
           if (!e.target.value) return;
           const novoFormato = formatarDataBR(e.target.value);
           if (novoFormato) onChange(novoFormato);
        }}
        className="text-xs font-bold text-slate-700 h-full bg-transparent outline-none px-2 w-full cursor-pointer"
        title="Escolher Data"
      />
    </div>
  );
};

export const HoraVariacao = ({ label, value, onChange }: any) => {
  return (
    <div className="flex items-center bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 rounded-lg shadow-sm transition-all overflow-hidden h-8 min-w-[120px]" onClick={(e) => e.stopPropagation()}>
      {label && (
        <span className="text-[10px] font-black text-slate-500 bg-slate-50 h-full flex items-center px-2.5 border-r border-slate-200 uppercase tracking-wider">
          <Clock size={12} className="mr-1.5 text-blue-500" />
          {label}
        </span>
      )}
      <input 
        type="time"
        value={converterTextoParaHoraIso(value)}
        onClick={(e: any) => e.target.showPicker && e.target.showPicker()}
        onChange={(e) => {
           if (!e.target.value) return;
           const novoFormato = formatarHoraBR(e.target.value);
           if (novoFormato) onChange(novoFormato);
        }}
        className="text-xs font-bold text-slate-700 h-full bg-transparent outline-none px-2 w-full cursor-pointer"
        title="Escolher Hora"
      />
    </div>
  );
};

export const TextoVariacao = ({ label, value, onChange, placeholder }: any) => {
  return (
    <div className="flex items-center bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 rounded-lg shadow-sm transition-all overflow-hidden h-8 max-w-[140px]" onClick={(e) => e.stopPropagation()}>
      {label && (
        <span className="text-[10px] font-black text-slate-500 bg-slate-50 h-full flex items-center px-2.5 border-r border-slate-200 uppercase tracking-wider">
          <Hash size={12} className="mr-1.5 text-blue-500" />
          {label}
        </span>
      )}
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs font-bold text-slate-700 w-full h-full px-2 bg-transparent outline-none text-center"
      />
    </div>
  );
};
