import { Check, ChevronDown, Copy, MessageSquare, Pencil, Send, Wifi, WifiOff } from 'lucide-react';
import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { decodePayload, NTFY, sendCommand } from '../../core/live/LiveShare';
import { MicButton } from '../components/MicButton';

// The 3D mirror pulls in three.js, so it loads separately from the light status view
const MirrorOffice = lazy(() => import('./MirrorOffice'));

/**
 * Phone page (`?takip=<topic>`): follows the desktop office live through ntfy.sh,
 * without loading the 3D scene. Approvals, feedback and lead chat are sent back
 * as commands.
 */

interface Snapshot {
  t: number;
  team: string;
  color: string;
  phase: 'idle' | 'working' | 'done';
  brief: string;
  cost: number;
  tokens: number;
  agents: { i: number; n: string; c: string; s: string; d: string }[];
  tasks: { id: string; ti: string; s: string; a: string; de?: string; dr?: string }[];
  log: { ts: number; a: string; x: string }[];
  hasFinal: boolean;
}

interface Output { title: string; agent: string; parts: string[]; of: number }

const PHASE: Record<string, [string, string]> = {
  idle: ['Başlamaya hazır', 'bg-zinc-600'],
  working: ['Ekip çalışıyor', 'bg-violet-600'],
  done: ['Teslim edildi', 'bg-emerald-600'],
};
const STATUS: Record<string, [string, string]> = {
  idle: ['Boşta', 'bg-zinc-500'],
  moving: ['Yürüyor', 'bg-sky-400'],
  working: ['Çalışıyor', 'bg-emerald-400'],
  on_hold: ['Onay bekliyor', 'bg-amber-400'],
  talking: ['Konuşuyor', 'bg-violet-400'],
};
const TASK_GROUPS: [string, string][] = [['in_progress', 'Yapılıyor'], ['scheduled', 'Planlandı'], ['done', 'Bitti']];

const ago = (ts: number, now: number) => {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s} sn önce`;
  if (s < 3600) return `${Math.round(s / 60)} dk önce`;
  return `${Math.round(s / 3600)} sa önce`;
};

const MobileViewer: React.FC<{ topic: string }> = ({ topic }) => {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [view, setView] = useState<'ofis' | 'durum'>('ofis');
  const [outputs, setOutputs] = useState<Record<string, Output>>({});
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const handle = async (raw: { id: string; event?: string; message?: string }) => {
      if (raw.event && raw.event !== 'message') return;
      if (!raw.message || seen.current.has(raw.id)) return;
      seen.current.add(raw.id);
      try {
        const msg = await decodePayload(raw.message);
        if (msg.k === 'state') setSnap((prev) => (!prev || msg.t >= prev.t ? msg : prev));
        if (msg.k === 'out') {
          setOutputs((prev) => {
            const cur = prev[msg.id] && prev[msg.id].of === msg.of ? prev[msg.id] : { title: msg.ti, agent: msg.a, parts: [], of: msg.of };
            const parts = [...cur.parts];
            parts[msg.p] = msg.x;
            return { ...prev, [msg.id]: { ...cur, parts } };
          });
        }
      } catch { /* not one of ours */ }
    };

    let es: EventSource | null = null;
    (async () => {
      try {
        const res = await fetch(`${NTFY}/${topic}/json?poll=1&since=12h`);
        const text = await res.text();
        for (const line of text.split('\n').filter(Boolean)) await handle(JSON.parse(line));
      } catch { /* history unavailable, live only */ }
      setLoaded(true);
      es = new EventSource(`${NTFY}/${topic}/sse`);
      es.onopen = () => setLive(true);
      es.onerror = () => setLive(false);
      es.onmessage = (ev) => handle(JSON.parse(ev.data));
    })();
    const tick = setInterval(() => setNow(Date.now()), 5000);
    return () => { es?.close(); clearInterval(tick); };
  }, [topic]);

  const pending = snap?.tasks.filter((t) => t.s === 'on_hold') ?? [];
  const finalText = outputs.final ? outputs.final.parts.join('') : '';

  return (
    <div className="min-h-full bg-[#0b1122] text-[#e7e9f5] font-sans pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b1122]/95 backdrop-blur border-b border-[#222c47] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white" style={{ backgroundColor: snap?.color || '#7c3aed' }}>
          {snap?.team?.[0] ?? 'N'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black truncate">{snap?.team ?? 'Nova Ofis'}</div>
          <div className="text-[11px] text-[#949bb6]">
            {snap ? `Son güncelleme ${ago(snap.t, now)}` : loaded ? 'Ofisten henüz veri gelmedi' : 'Bağlanılıyor…'}
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${live ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {live ? <Wifi size={12} /> : <WifiOff size={12} />} {live ? 'CANLI' : 'BAĞLANTI YOK'}
        </span>
      </div>

      {/* Tabs: live 3D office (default) or the status lists */}
      <div className="sticky top-[61px] z-10 bg-[#0b1122] px-4 pt-2 pb-2 flex gap-2">
        {(['ofis', 'durum'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${view === v ? 'bg-violet-600 text-white' : 'bg-[#121a2f] text-[#949bb6]'}`}
          >
            {v === 'ofis' ? '🏢 Ofis' : `📋 Durum${pending.length ? ` (${pending.length} onay)` : ''}`}
          </button>
        ))}
      </div>

      {view === 'ofis' && (
        <div className="fixed inset-x-0 top-[113px] bottom-[96px]">
          <Suspense fallback={<div className="p-6 text-sm text-[#949bb6]">Ofis yükleniyor…</div>}>
            <MirrorOffice snapshot={snap as any} onUnsupported={() => setView('durum')} />
          </Suspense>
          {pending.length > 0 && (
            <button onClick={() => setView('durum')} className="absolute top-3 inset-x-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-black shadow-lg">
              🟣 {pending.length} iş onayını bekliyor — dokun
            </button>
          )}
        </div>
      )}

      {view === 'durum' && (<>
      {!snap && loaded && (
        <div className="m-4 p-4 rounded-2xl bg-[#121a2f] border border-[#222c47] text-sm text-[#b4bace] leading-relaxed">
          Bilgisayardaki ofiste <b>📱 Telefondan Takip</b> açık olmalı ve ofis sekmesi açık kalmalı. Ekip bir şey yaptığında burada anında görünür.
        </div>
      )}

      {snap && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-black uppercase tracking-wider text-white px-3 py-1 rounded-full ${PHASE[snap.phase]?.[1]}`}>{PHASE[snap.phase]?.[0]}</span>
            <span className="text-[11px] text-[#949bb6] font-mono">{snap.tokens.toLocaleString('tr-TR')} token · ${snap.cost.toFixed(3)}</span>
          </div>

          {snap.brief && (
            <Card title="Proje özeti">
              <p className="text-sm text-[#cdd1e4] leading-relaxed whitespace-pre-wrap">{snap.brief}</p>
            </Card>
          )}

          {pending.length > 0 && (
            <Card title={`Onayını bekleyenler (${pending.length})`} accent>
              <div className="space-y-3">
                {pending.map((t) => <PendingTask key={t.id} topic={topic} task={t} />)}
              </div>
            </Card>
          )}

          {finalText && (
            <Card title="✅ Son teslim" accent>
              <OutputBody text={finalText} complete={outputs.final.parts.filter(Boolean).length === outputs.final.of} />
            </Card>
          )}

          <Card title="Ekip">
            <div className="grid grid-cols-2 gap-2">
              {snap.agents.map((a) => (
                <div key={a.i} className="rounded-xl bg-[#18213a] p-2.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.c }} />
                    <span className="text-xs font-bold truncate">{a.n}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS[a.s]?.[1] ?? 'bg-zinc-500'}`} />
                    <span className="text-[10px] text-[#949bb6] truncate">{a.d || STATUS[a.s]?.[0] || a.s}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {TASK_GROUPS.map(([status, label]) => {
            const list = snap.tasks.filter((t) => t.s === status);
            if (!list.length) return null;
            return (
              <Card key={status} title={`${label} (${list.length})`}>
                <div className="space-y-2">
                  {list.map((t) => <TaskRow key={t.id} task={t} output={outputs[t.id]} />)}
                </div>
              </Card>
            );
          })}

          {snap.log.length > 0 && (
            <Card title="Son hareketler">
              <ul className="space-y-1.5">
                {[...snap.log].reverse().map((l, i) => (
                  <li key={i} className="text-xs text-[#b4bace]"><b className="text-[#e7e9f5]">{l.a}</b> {l.x} <span className="text-[#5f6684]">· {ago(l.ts, now)}</span></li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      </>)}

      <ChatBar topic={topic} agents={snap?.agents ?? []} />
    </div>
  );
};

const Card: React.FC<{ title: string; accent?: boolean; children: React.ReactNode }> = ({ title, accent, children }) => (
  <section className={`rounded-2xl p-4 border ${accent ? 'bg-violet-950/40 border-violet-500/40' : 'bg-[#121a2f] border-[#222c47]'}`}>
    <h2 className="text-[11px] font-black uppercase tracking-widest text-[#949bb6] mb-3">{title}</h2>
    {children}
  </section>
);

const OutputBody: React.FC<{ text: string; complete?: boolean }> = ({ text, complete = true }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="markdown-content text-sm text-[#cdd1e4] leading-relaxed break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
      {!complete && <p className="text-[11px] text-amber-400 mt-2">Metnin kalanı geliyor…</p>}
      <button
        onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
        className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-violet-300"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Kopyalandı' : 'Kopyala'}
      </button>
    </div>
  );
};

const TaskRow: React.FC<{ task: Snapshot['tasks'][number]; output?: Output }> = ({ task, output }) => {
  const [open, setOpen] = useState(false);
  const text = output ? output.parts.join('') : '';
  return (
    <div className="rounded-xl bg-[#18213a] p-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-2 text-left">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">{task.ti}</div>
          <div className="text-[11px] text-[#949bb6]">{task.a}</div>
        </div>
        {(text || task.de) && <ChevronDown size={16} className={`shrink-0 text-[#949bb6] transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && (
        <div className="mt-2 pt-2 border-t border-[#222c47]">
          {text ? <OutputBody text={text} complete={output!.parts.filter(Boolean).length === output!.of} /> : <p className="text-xs text-[#b4bace]">{task.de}</p>}
        </div>
      )}
    </div>
  );
};

const PendingTask: React.FC<{ topic: string; task: Snapshot['tasks'][number] }> = ({ topic, task }) => {
  const [mode, setMode] = useState<'idle' | 'feedback' | 'sent'>('idle');
  const [feedback, setFeedback] = useState('');
  const send = async (type: 'approve' | 'reject') => {
    await sendCommand(topic, { type, taskId: task.id, text: type === 'reject' ? feedback.trim() : undefined });
    setMode('sent');
  };
  return (
    <div className="rounded-xl bg-[#121a2f] p-3 border border-violet-500/30">
      <div className="text-sm font-bold">{task.ti}</div>
      <div className="text-[11px] text-[#949bb6] mb-2">{task.a}</div>
      {task.dr && <div className="markdown-content text-xs text-[#cdd1e4] max-h-60 overflow-auto mb-3"><ReactMarkdown remarkPlugins={[remarkGfm]}>{task.dr}</ReactMarkdown></div>}
      {mode === 'sent' && <p className="text-xs text-emerald-400 font-bold">Gönderildi ✓ — ofis birkaç saniye içinde uygular.</p>}
      {mode === 'idle' && (
        <div className="flex gap-2">
          <button onClick={() => send('approve')} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white rounded-xl py-2.5 text-xs font-black">
            <Check size={14} /> Onayla
          </button>
          <button onClick={() => setMode('feedback')} className="flex-1 flex items-center justify-center gap-1.5 bg-[#28334f] text-white rounded-xl py-2.5 text-xs font-black">
            <Pencil size={14} /> Düzelttir
          </button>
        </div>
      )}
      {mode === 'feedback' && (
        <div className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Neyi değiştirsin?"
            rows={3}
            className="w-full rounded-xl bg-[#0b1122] border border-[#2c3756] p-2 text-sm text-[#e7e9f5]"
          />
          <button disabled={!feedback.trim()} onClick={() => send('reject')} className="w-full bg-violet-600 disabled:opacity-40 text-white rounded-xl py-2.5 text-xs font-black">
            Geri bildirimi gönder
          </button>
        </div>
      )}
    </div>
  );
};

const ChatBar: React.FC<{ topic: string; agents: Snapshot['agents'] }> = ({ topic, agents }) => {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [target, setTarget] = useState<number | ''>('');
  const submit = async () => {
    if (!text.trim()) return;
    await sendCommand(topic, { type: 'chat', text: text.trim(), agent: target === '' ? undefined : target });
    setText('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };
  return (
    <div className="fixed bottom-0 inset-x-0 bg-[#0b1122]/95 backdrop-blur border-t border-[#222c47] p-3">
      <div className="text-[10px] text-[#949bb6] mb-1.5 flex items-center gap-1">
        <MessageSquare size={11} /> {sent ? 'İletildi ✓' : 'Mesaj gönder:'}
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value === '' ? '' : Number(e.target.value))}
          className="ml-1 bg-[#121a2f] border border-[#2c3756] rounded-lg px-1.5 py-0.5 text-[10px] text-[#e7e9f5]"
        >
          <option value="">Lider ajan</option>
          {agents.map((a) => <option key={a.i} value={a.i}>{a.n}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Örn: Yeni video için konu bulalım"
          className="flex-1 rounded-xl bg-[#121a2f] border border-[#2c3756] px-3 py-2.5 text-sm text-[#e7e9f5] placeholder:text-[#5f6684]"
        />
        <MicButton value={text} onChange={setText} className="w-11 !rounded-xl !bg-[#18213a]" />
        <button onClick={submit} className="w-11 rounded-xl bg-violet-600 flex items-center justify-center text-white"><Send size={16} /></button>
      </div>
    </div>
  );
};

export default MobileViewer;
