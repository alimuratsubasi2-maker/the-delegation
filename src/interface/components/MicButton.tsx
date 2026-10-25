import { Mic, MicOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

/**
 * Turkish voice dictation via the browser's Web Speech API (Chrome / Edge / Android).
 * Appends the recognised text to whatever is already typed. Hidden where unsupported.
 */

const Recognition: any = typeof window !== 'undefined'
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  : undefined;

export const MicButton: React.FC<{ value: string; onChange: (v: string) => void; className?: string }> = ({ value, onChange, className = '' }) => {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const baseRef = useRef('');

  useEffect(() => () => recRef.current?.abort?.(), []);

  if (!Recognition) return null;

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Recognition();
    rec.lang = 'tr-TR';
    rec.interimResults = true;
    rec.continuous = true;
    baseRef.current = value ? value.trimEnd() + ' ' : '';
    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      onChange(baseRef.current + text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? 'Dinlemeyi durdur' : 'Sesle yaz (Türkçe)'}
      className={`shrink-0 flex items-center justify-center rounded-2xl transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-100 text-zinc-400 hover:text-darkDelegation'} ${className}`}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
};
