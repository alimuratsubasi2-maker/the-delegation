import { Check, Copy, Mail, Square, Volume2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

/**
 * Copy / listen / open-in-Gmail actions for any agent output.
 * Listening uses the browser's Turkish voices (Edge ships the natural "Ahmet" voice);
 * Gmail opens a prefilled compose window, the user presses Send themselves.
 */

/** Markdown → plain text for speech and email bodies. */
export function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__|\*|_|`)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pickTurkishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const tr = voices.filter((v) => v.lang.toLowerCase().startsWith('tr'));
  return tr.find((v) => /ahmet/i.test(v.name)) || tr.find((v) => /natural|online/i.test(v.name)) || tr[0];
}

/** Pulls "Konu: …" / "Subject: …" out of an email draft if present. */
function splitEmail(text: string): { subject: string; body: string } {
  const plain = toPlainText(text);
  const m = plain.match(/^\s*(?:konu|subject)\s*[:：]\s*(.+)$/im);
  const subject = m ? m[1].trim() : 'tanışma';
  const body = m ? plain.replace(m[0], '').trim() : plain;
  return { subject, body };
}

export const OutputActions: React.FC<{ text: string; showEmail?: boolean; className?: string }> = ({ text, showEmail, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => { if (canSpeak) window.speechSynthesis.cancel(); }, [canSpeak]);

  const speak = () => {
    if (!canSpeak) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(toPlainText(text).slice(0, 6000));
    const voice = pickTurkishVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang || 'tr-TR';
    u.rate = 1.05;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const openGmail = () => {
    const { subject, body } = splitEmail(text);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 6000))}`;
    window.open(url, '_blank', 'noopener');
  };

  const btn = 'flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-black uppercase text-zinc-500 hover:text-darkDelegation transition-colors';
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      <button
        className={btn}
        onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Kopyalandı' : 'Kopyala'}
      </button>
      {canSpeak && (
        <button className={btn} onClick={speak} title="Türkçe sesle oku">
          {speaking ? <Square size={13} /> : <Volume2 size={13} />} {speaking ? 'Durdur' : 'Sesli dinle'}
        </button>
      )}
      {showEmail && (
        <button className={btn} onClick={openGmail} title="Hazır taslak olarak Gmail'de aç — Gönder'e sen basarsın">
          <Mail size={13} /> Gmail'de aç
        </button>
      )}
    </div>
  );
};
