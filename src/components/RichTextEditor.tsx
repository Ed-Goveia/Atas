import React, { useState, useRef, useEffect } from 'react';
import { compileTextToHtml, htmlToTemplate } from '../lib/ataTemplate';

export const RichTextEditor = ({ value, onChange, placeholder, minHeight = "100px", vars, readOnly }: any) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isFocused) {
      const currentHtml = editorRef.current.innerHTML;
      const newHtml = compileTextToHtml(value, vars);
      if (currentHtml !== newHtml) {
        editorRef.current.innerHTML = newHtml;
      }
    }
  }, [value, vars, isFocused]);

  const handleInput = () => { 
    if(editorRef.current && !readOnly) {
      const rawHtml = editorRef.current.innerHTML;
      const templateStr = htmlToTemplate(rawHtml);
      onChange(templateStr); 
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable={readOnly ? "false" : "true"}
      suppressContentEditableWarning
      onFocus={() => { if(!readOnly) setIsFocused(true); }}
      onBlur={() => { if(!readOnly) { setIsFocused(false); handleInput(); } }}
      onInput={handleInput}
      data-placeholder={placeholder}
      className={`w-full p-5 font-serif text-[15px] leading-relaxed focus:outline-none bg-transparent resize-y overflow-y-auto [&_b]:font-bold [&_strong]:font-bold [&_*[style*="bold"]]:font-bold transition-colors ${readOnly ? 'cursor-default pointer-events-none' : 'ring-2 ring-inset ring-blue-100 bg-blue-50/10'}`}
      style={{ minHeight }}
    />
  );
};
