import { ArrowLeft, Check, Copy, Download, History, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArchivedProject, archiveToMarkdown, useArchiveStore } from '../core/archive/ProjectArchive';

interface ArchiveModalProps {
  onClose: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ onClose }) => {
  const { items, remove } = useArchiveStore();
  const [open, setOpen] = useState<ArchivedProject | null>(null);
  const [copied, setCopied] = useState(false);

  const download = (p: ArchivedProject) => {
    const url = URL.createObjectURL(new Blob([archiveToMarkdown(p)], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-ofis-${new Date(p.date).toISOString().slice(0, 10)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-auto">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-white rounded-[32px] border border-violet-500/30 overflow-hidden">
        <div className="flex items-center gap-3 px-7 py-5 border-b border-zinc-100">
          {open ? (
            <button onClick={() => setOpen(null)} className="text-zinc-400 hover:text-darkDelegation"><ArrowLeft size={18} /></button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center"><History size={18} className="text-white" /></div>
          )}
          <h2 className="text-xl font-black text-darkDelegation flex-1 truncate">{open ? open.team : 'Geçmiş Projeler'}</h2>
          <button onClick={onClose} className="text-zinc-300 hover:text-zinc-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {!open && items.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-16">Henüz teslim edilen proje yok. Ekip bir projeyi bitirdiğinde burada saklanır.</p>
          )}

          {!open && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <button onClick={() => setOpen(p)} className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-bold text-darkDelegation truncate">{p.brief || p.team}</div>
                    <div className="text-[11px] text-zinc-400">{p.team} · {new Date(p.date).toLocaleString('tr-TR')} · {p.tasks.length} çıktı · ${p.cost.toFixed(3)}</div>
                  </button>
                  <button onClick={() => download(p)} className="p-2 text-zinc-400 hover:text-darkDelegation" title=".md indir"><Download size={15} /></button>
                  <button onClick={() => remove(p.id)} className="p-2 text-zinc-300 hover:text-red-500" title="Sil"><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
          )}

          {open && (
            <div>
              <div className="text-[11px] text-zinc-400 mb-4">{new Date(open.date).toLocaleString('tr-TR')} · {open.brief}</div>
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => navigator.clipboard.writeText(archiveToMarkdown(open)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />} Tümünü kopyala
                </button>
                <button onClick={() => download(open)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-[10px] font-black uppercase">
                  <Download size={12} /> .md indir
                </button>
              </div>
              <div className="markdown-content text-sm text-zinc-600 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{archiveToMarkdown(open)}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
